import * as fs from "node:fs";
import * as path from "node:path";
import * as esbuild from "esbuild";
import { ModuleSystem, PackageInfo, transform } from "@rttist/ts-loader-wasm";
import {
	type Config,
	ConfigProvider,
	FsCachedStorage,
	IncrementalGenerator,
	LogBuffer,
	Logger,
	printInitialMessage,
} from "@rttist/typegen";

const ESBUILD_COMMON_OPTIONS = new Set([
	"sourcemap",
	"legalComments",
	"sourceRoot",
	"sourcesContent",
	"format",
	"globalName",
	"target",
	"supported",
	"platform",
	"mangleProps",
	"reserveProps",
	"mangleQuoted",
	"mangleCache",
	"drop",
	"dropLabels",
	"minify",
	"minifyWhitespace",
	"minifyIdentifiers",
	"minifySyntax",
	"lineLimit",
	"charset",
	"treeShaking",
	"ignoreAnnotations",
	"jsx",
	"jsxFactory",
	"jsxFragment",
	"jsxImportSource",
	"jsxDev",
	"jsxSideEffects",
	"define",
	"pure",
	"keepNames",
	"color",
	"logLevel",
	"logLimit",
	"logOverride",
	"tsconfigRaw",
]);

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

export function rttistPlugin(pluginOptions: RttistPluginOptions) {
	return {
		name: "esbuild-plugin-rttist",
		async setup(build) {
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

			// Generate initial metadata
			await incrementalGenerator.generate([], false, true);

			build.onResolve({ filter: /^(rttist\/typelib)|(virtual:typelib)$/ }, (args) => {
				return {
					path: typelibPath,
				} satisfies esbuild.OnResolveResult;
			});

			build.onStart(async () => {
				// Block rebuild for metadata files if the generator is currently running;
				// it was probably invoked by another file change.
				// It will invalidate the file via HMR API afterwards if the metadata was changed.
				if (incrementalGenerator.isGenerating()) {
					logger.debug("WATCH: preventing update because generating is currently in progress.");
					return;
				}

				// We have to regenerate all files, because ESBUILD does not tell us which files were changed.
				// Unchanged files will be detected by the incremental generator and will not be regenerated.
				await incrementalGenerator.generate([], false, true);
			});

			build.onLoad({ filter: /\.(tsx?|mts|cts)$/ }, async (args) => {
				const input = await fs.promises.readFile(args.path, "utf8");

				// Transform the code
				const transformed = transformCode(input, args.path, tsRootDir, pluginOptions, config);

				// Transpile the code using esbuild
				const options: esbuild.TransformOptions = {
					sourcefile: args.path,
					loader: "ts",
					tsconfigRaw: build.initialOptions.tsconfigRaw,
				};

				for (const prop of Object.keys(build.initialOptions)) {
					if (ESBUILD_COMMON_OPTIONS.has(prop)) {
						(options as any)[prop] = (build.initialOptions as any)[prop];
					}
				}

				const contents = (await esbuild.transform(transformed, options)).code;

				return {
					contents: contents,
				} satisfies esbuild.OnLoadResult;
			});
		},
	} as esbuild.Plugin;
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
