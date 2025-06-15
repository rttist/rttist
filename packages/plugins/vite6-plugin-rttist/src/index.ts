import { ModuleSystem, PackageInfo, transform } from "@rttist/ts-loader-wasm";
import {
	FsCachedStorage,
	IncrementalGenerator,
	LogBuffer,
	Logger,
	ConfigProvider,
	printInitialMessage,
	type Config,
} from "@rttist/typegen";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ConfigEnv, HmrContext, Plugin, UserConfig } from "vite";

const TS_FILE_NAME_REGEX = /\.[mc]?tsx?/i;
const VUE_SCRIPT_REGEX = /<script .*>([\s\S]*)<\/script>/gi;

export type RttistPluginOptions = {
	packageInfo: {
		/**
		 * Name of the package (NPM) used to index type and module identifiers in the metadata.
		 */
		name: string;

		/**
		 * Root directory of the package, where the `package.json` is located.
		 */
		rootDir: string;
	};

	/**
	 * Project root directory where tsconfig and rttist config files are located.
	 */
	projectRoot: string;

	/**
	 * Use RTTIST to transpile TypeScript files to JavaScript (currently using OXC).
	 * @deprecated Marking with deprecated just to highlight it, but it is just not implemented yet.
	 */
	handleTranspilation?: boolean;

	/**
	 * Directory where TypeScript files are located.
	 * This is used to resolve relative paths in the metadata.
	 * This is determined automatically from the `tsconfig.json` file, but can be overridden.
	 */
	tsRootDir?: string;
};

export async function rttistPlugin(pluginOptions: RttistPluginOptions): Promise<Plugin> {
	if (!pluginOptions.projectRoot || pluginOptions.projectRoot.length === 0) {
		throw new Error("projectRoot is required");
	}

	const config = await ConfigProvider.getConfig({
		projectRoot: pluginOptions.projectRoot,
		typecheck: true,
		watch: false,
		force: false,
	});

	const logger = new Logger("vite-plugin-rttist", undefined, LogBuffer.autoFlush);
	Logger.setLevel(config.logLevel);

	const tsRootDir = pluginOptions.tsRootDir ?? config.tsRootDir;

	if (
		!pluginOptions.packageInfo ||
		!pluginOptions.packageInfo.rootDir ||
		pluginOptions.packageInfo.rootDir.length === 0
	) {
		throw new Error("packageInfo.rootDir is required");
	}

	if (!pluginOptions.packageInfo.name || pluginOptions.packageInfo.name.length === 0) {
		throw new Error("packageInfo.name is required");
	}

	// let viteOutDir: string | null = null;
	// let viteCommand: "build" | "serve" | null = null;

	printInitialMessage(logger, config);

	const metadataCachedStorage = new FsCachedStorage(config);
	const sourceFileCachedStorage = new FsCachedStorage(config);

	// Create incremental generator
	const incrementalGenerator = new IncrementalGenerator(
		config,
		logger,
		sourceFileCachedStorage,
		metadataCachedStorage
	);
	await incrementalGenerator.initialize();

	const normalizedCacheDir = config.cacheDir.replace(/\\/g, "/");
	const typelibPath = `${normalizedCacheDir}/metadata.typelib.ts`;
	const relativeCacheDir = path.relative(config.projectRoot, config.cacheDir);

	function isMetadataFile(filePath: string): boolean {
		return filePath.startsWith(normalizedCacheDir);
	}

	// Generate initial metadata
	await incrementalGenerator.generate([], false, true);

	return {
		name: "vite-plugin-rttist",
		enforce: "pre",

		// configResolved(config: ResolvedConfig) {
		// 	viteOutDir = config.build.outDir;
		// },

		resolveId(id: string) {
			if (id === "rttist/typelib" || id === "virtual:typelib") {
				return typelibPath;
			}
		},

		// buildStart(options: unknown) {
		// 	printInitialMessage(logger, config);
		// },

		async handleHotUpdate(ctx: HmrContext) {
			// Block HMR for metadata files if the generator is currently running;
			// it was probably invoked by another file change.
			// It will invalidate the file via HMR API afterwards if the metadata was changed.
			if (isMetadataFile(ctx.file) && incrementalGenerator.isGenerating()) {
				logger.debug("HMR: preventing update because generating is currently in progress.\n\tFile: ", ctx.file);
				return [];
			}

			if (incrementalGenerator.isProjectFile(ctx.file)) {
				// Update source file in cache
				const content = await ctx.read();
				sourceFileCachedStorage.updateMemoryCacheOnly(ctx.file, content);
				const normalized = ctx.file.replace(`${config.normalizedProjectRoot}/`, "");
				sourceFileCachedStorage.updateMemoryCacheOnly(normalized, content);

				const regeneratedFiles = await incrementalGenerator.generate([ctx.file], false, false);

				const regeneratedMetadataModuleNodes = Object.values(regeneratedFiles)
					.map((m) => ctx.server.moduleGraph.getModuleById(m.metadataSourceFilePath.replace(/\\/g, "/")))
					.filter((m) => m !== undefined);

				logger.debug(
					"ModuleNodes that should be updated:",
					[...ctx.modules, ...regeneratedMetadataModuleNodes].map((x) => x?.id)
				);

				return [...ctx.modules, ...regeneratedMetadataModuleNodes];
			}
		},

		async load(id: string) {
			// console.log("LOAD ", id);

			if (id === typelibPath) {
				const typelibContent = await metadataCachedStorage.read(typelibPath);

				if (typelibContent) {
					return typelibContent;
				}
			}

			// Load all .metadata/** files from cache
			if (id.startsWith(normalizedCacheDir)) {
				return await metadataCachedStorage.read(id);
			}

			// If the file is not a project file (included by include specifier in reflect config),
			// we don't want to transform it.
			if (!incrementalGenerator.isProjectFile(id)) {
				// console.log("Ignored", id);
				return;
			}

			if (id.endsWith(".vue")) {
				// Handle .vue files -> transform only the TYPESCRIPT part
				let code = await fs.promises.readFile(id, "utf8");

				// TODO: This is just a super simple implementation to get it working. Should be implemented using proper parser.
				code = code.replace(VUE_SCRIPT_REGEX, (_: string, code: string) => {
					return transformCode(code, id, tsRootDir, pluginOptions, config);
				});

				return code;
			}

			// Transform all TS files
			if (TS_FILE_NAME_REGEX.test(id)) {
				let code = await fs.promises.readFile(id, "utf8");
				code = transformCode(code, id, tsRootDir, pluginOptions, config);
				return code;
			}
		},
		config(_: UserConfig, env: ConfigEnv) {
			// viteCommand = env.command;

			return {
				server: {
					watch: {
						// Ignore: .metadata/*.json
						ignored: [new RegExp(`${relativeCacheDir}/.*?\.json`)],
					},
				},
			};
		},
	};
}

function transformCode(
	code: string,
	filePath: string,
	tsRootDir: string,
	pluginOptions: RttistPluginOptions,
	config: Config
) {
	return transform(
		code,
		filePath,
		new PackageInfo(pluginOptions.packageInfo.name, tsRootDir), // TODO: We abuse PackageInfo.rootDir to pass tsRootDir, but it should be correct; even if the package root differ from tsRoot, we want to generate paths from tsRoot
		{
			// TODO: Reflect configuration
			module: ModuleSystem.Preserve,
			runtimeGenericClasses: config.useRuntimeGenericClasses,
		}
	);
}
