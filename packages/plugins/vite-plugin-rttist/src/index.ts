import { ModuleSystem, PackageInfo, transform } from "@rttist/ts-loader-wasm";
import { FsCachedStorage, IncrementalGenerator, LogBuffer, Logger, printInitialMessage } from "@rttist/typegen";
import * as fs from "node:fs";
import type { ConfigEnv, HmrContext, Plugin, ResolvedConfig, UserConfig } from "vite";

const TS_FILE_NAME_REGEX = /\.[mc]?tsx?/i;
const VUE_SCRIPT_REGEX = /<script .*>([\s\S]*)<\/script>/gi;
const VIRTUAL_TYPELIB_RESOLVE_ID = "\0virtual:typelib";
// const VIRTUAL_INTERNAL_TYPELIB_RESOLVE_ID = "\0virtual:internal.typelib";

// const TYPELIB_REGEX = /\/internal.typelib$/;
// const PREFIXED_TYPELIB_REGEX = /\u{0}.*\/internal.typelib$/u;

// SEE: https://vitejs.dev/guide/api-plugin.html

export type RttistPluginOptions = {
	packageInfo: {
		name: string;
		rootDir: string;
	};

	/**
	 * Project root directory where tsconfig and rttist config files are located.
	 */
	projectRoot: string;

	tsRootDir: string;

	/**
	 * The directory where the metadata files will be written to. This should match the `metadata.ourDir` option from your reflect.config file.
	 */
	metadataOutDir: string;
};

// let rttistGenerator;
// let typelibModule: ModuleNode | null;
// let internalTypelibModule: ModuleNode | null;

export async function rttistPlugin(pluginOptions: RttistPluginOptions): Promise<Plugin> {
	if (!pluginOptions.tsRootDir || pluginOptions.tsRootDir.length === 0) {
		throw new Error("tsRootDir is required");
	}

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

	if (!pluginOptions.metadataOutDir || pluginOptions.metadataOutDir.length === 0) {
		throw new Error("metadataOutDir is required");
	}

	let viteOutDir: string | null = null;
	const viteCommand: string | null = null;
	// let metadataTypelibModule: ModuleNode | null = null;

	const logger = new Logger("vite-plugin-rttist", undefined, LogBuffer.autoFlush);

	const incrementalGenerator = await IncrementalGenerator.create(
		logger,
		new FsCachedStorage(),
		new FsCachedStorage(),
		{
			projectRoot: pluginOptions.projectRoot,
		}
	);

	Logger.setLevel(incrementalGenerator.config.logLevel);
	printInitialMessage(logger, incrementalGenerator.config);

	const metadataGeneratorResult = await incrementalGenerator.generate([], false, true);

	return {
		name: "vite-plugin-rttist",
		enforce: "pre",
		configResolved(config: ResolvedConfig) {
			viteOutDir = config.build.outDir;
		},
		resolveId(id: string) {
			if (id === "rttist/typelib" || id === "virtual:typelib") {
				return `${incrementalGenerator.config.cacheDir}/metadata.typelib.ts`;
			}
		},
		configureServer(server) {
			const [metadataUrl, metadataModuleNode] =
				Array.from(server.moduleGraph.urlToModuleMap.entries()).find(([url, module]) =>
					url.endsWith("/metadata.typelib.ts")
				) ?? [];
			// server.moduleGraph.getModuleByUrl(met);
			// server.moduleGraph.updateModuleInfo(metadataModuleNode);
			console.log(metadataUrl, metadataModuleNode);
		},

		// buildStart(options: unknown) {
		// 	// rttistGenerator = new RttistGeneratorApi();
		// },

		handleHotUpdate(ctx: HmrContext) {
			incrementalGenerator.generate([ctx.file], false, false);

			// debugger;
			return [];
		},
		// 	if (typelibModule === undefined) {
		// 		typelibModule = ctx.server.moduleGraph.getModuleById(VIRTUAL_TYPELIB_RESOLVE_ID) ?? null;
		// 	}
		//
		// 	if (internalTypelibModule === undefined) {
		// 		internalTypelibModule =
		// 			ctx.server.moduleGraph.getModuleById(VIRTUAL_INTERNAL_TYPELIB_RESOLVE_ID) ?? null;
		// 	}
		//
		// 	const invalidatedModules = new Set<ModuleNode>();
		//
		// 	// When any file gets updated, we should invalidate typelibs
		// 	// MAYDO: can be optimized for files that contains no types, classes, functions etc. impacting typelibs
		// 	if (typelibModule !== null) {
		// 		ctx.server.moduleGraph.invalidateModule(typelibModule, invalidatedModules, ctx.timestamp, true);
		// 	}
		//
		// 	if (internalTypelibModule !== null) {
		// 		ctx.server.moduleGraph.invalidateModule(internalTypelibModule, invalidatedModules, ctx.timestamp, true);
		// 	}
		//
		// 	// // Check dependencies if it contains typelib
		// 	// const invalidatedModules = new Set<ModuleNode>();
		// 	//
		// 	// for (const mod of ctx.modules) {
		// 	// 	ctx.server.moduleGraph.invalidateModule(mod, invalidatedModules, ctx.timestamp, true);
		// 	// }
		//
		// 	// ctx.server.hot.send({ type: 'full-reload' })
		//
		// 	return [];
		//
		// 	// const invalidatedModules = new Set<ModuleNode>();
		// 	//
		// 	// for (let module of ctx.modules) {
		// 	// 	for (let importer of module.importers) {
		// 	// 		if (importer.url.includes("/metadata.typelib.ts")) {
		// 	// 			continue;
		// 	// 		}
		// 	// 		ctx.server.moduleGraph.invalidateModule(importer, invalidatedModules, ctx.timestamp, true);
		// 	// 		// ctx.server.hot.send({
		// 	// 		// 	type: "update",
		// 	// 		// 	updates: [
		// 	// 		// 		{
		// 	// 		// 			type: `js-update`,
		// 	// 		// 			timestamp: ctx.timestamp,
		// 	// 		// 			path: importer.url,
		// 	// 		// 			explicitImportRequired: false,
		// 	// 		// 			// explicitImportRequired: boundary.type === 'js'
		// 	// 		// 			// 	? isExplicitImportRequired(acceptedVia.url)
		// 	// 		// 			// 	: undefined,
		// 	// 		// 			acceptedPath: importer.url,
		// 	// 		// 		},
		// 	// 		// 	],
		// 	// 		// });
		// 	// 	}
		// 	// }
		// 	//
		// 	// // Ignore update of metadata.typelib.ts; it's changed together with internal.typelib that causes a loop.
		// 	// // Ignoring metadata.typelib is fine, because it gets invalidated by update of internal.typelib.ts.
		// 	// if (ctx.file.includes("/metadata.typelib.ts")) {
		// 	// 	// metadataTypelibModule = ctx.modules[0];
		// 	//
		// 	// 	// for (let module of ctx.modules) {
		// 	// 	// 	for (let importer of module.importers) {
		// 	// 	// 		ctx.server.ws.send({
		// 	// 	// 			type: "update",
		// 	// 	// 			updates: [
		// 	// 	// 				{
		// 	// 	// 					type: `js-update`,
		// 	// 	// 					timestamp: ctx.timestamp,
		// 	// 	// 					path: importer.url,
		// 	// 	// 					explicitImportRequired: false,
		// 	// 	// 					// explicitImportRequired: boundary.type === 'js'
		// 	// 	// 					// 	? isExplicitImportRequired(acceptedVia.url)
		// 	// 	// 					// 	: undefined,
		// 	// 	// 					acceptedPath: importer.url,
		// 	// 	// 				},
		// 	// 	// 			],
		// 	// 	// 		});
		// 	// 	// 	}
		// 	// 	// }
		// 	//
		// 	// 	return [];
		// 	// }
		// 	//
		// 	// // Ignore update of depending modules when internal.typelib is updated
		// 	// if (ctx.file.includes("/internal.typelib.js")) {
		// 	// 	// // Also use `server.ws.send` to support Vite <5.1 if needed
		// 	// 	// ctx.server.hot.send({ type: 'full-reload' });
		// 	//
		// 	// 	// if (metadataTypelibModule) {
		// 	// 	// 	ctx.server.ws.send({
		// 	// 	// 		type: "update",
		// 	// 	// 		updates: [
		// 	// 	// 			{
		// 	// 	// 				type: `js-update`,
		// 	// 	// 				timestamp: ctx.timestamp,
		// 	// 	// 				path: metadataTypelibModule.url,
		// 	// 	// 				explicitImportRequired: true,
		// 	// 	// 				// explicitImportRequired: boundary.type === 'js'
		// 	// 	// 				// 	? isExplicitImportRequired(acceptedVia.url)
		// 	// 	// 				// 	: undefined,
		// 	// 	// 				acceptedPath: metadataTypelibModule.url,
		// 	// 	// 			},
		// 	// 	// 		],
		// 	// 	// 	});
		// 	// 	// }
		// 	//
		// 	// 	// // Invalidate modules manually
		// 	// 	// const invalidatedModules = new Set<ModuleNode>();
		// 	// 	// for (const mod of ctx.modules) {
		// 	// 	// 	ctx.server.moduleGraph.invalidateModule(mod, invalidatedModules, ctx.timestamp, true);
		// 	// 	// }
		// 	//
		// 	// 	return [];
		// 	// }
		// },

		async load(id: string) {
			// if (id === VIRTUAL_TYPELIB_RESOLVE_ID) {
			// 	debugger;
			// }

			// 			// TODO: This is way how to handle HMR of metadata.typelib; we can rewrite types in global type lib
			// 			if (viteCommand === "serve" && id.endsWith("/metadata.typelib.ts")) {
			// 				return (
			// 					(await fs.promises.readFile(id, "utf8")) +
			// 					`
			// if (import.meta.hot) {
			// 	import.meta.hot.accept(["rttist", "./internal.typelib"]);
			// 	// import.meta.hot.on("vite:beforeUpdate", () => {
			// 	// 	Metadata.clearMetadata();
			// 	// });
			// 	// import.meta.hot.accept();
			// }`
			// 				);
			// 			}

			// // Read internal.typelib from disk
			// if (PREFIXED_TYPELIB_REGEX.test(id)) {
			// 	const internalTypelibPath = resolve(pluginOptions.metadataOutDir, "internal.typelib.js");
			// 	return await fs.promises.readFile(internalTypelibPath, "utf8");
			// }

			// Handle .vue files -> transform only the TYPESCRIPT part
			if (id.endsWith(".vue")) {
				let code = await fs.promises.readFile(id, "utf8");

				// TODO: This is just a super simple implementation to get it working. Should be implemented using proper parser.
				code = code.replace(VUE_SCRIPT_REGEX, (_: string, code: string) => {
					return transformCode(code, id, pluginOptions);
				});

				return code;
			}

			// Transform all TS files
			if (TS_FILE_NAME_REGEX.test(id)) {
				let code = await fs.promises.readFile(id, "utf8");
				code = transformCode(code, id, pluginOptions);
				return code;
			}
		},
		// config(_: UserConfig, env: ConfigEnv) {
		// 	viteCommand = env.command;
		//
		// 	return {
		// 		server: {
		// 			watch: {
		// 				ignored: [/\/.metadata\//],
		// 			},
		// 		},
		// 	};
		// },
	};
}

function transformCode(code: string, filePath: string, pluginOptions: RttistPluginOptions) {
	return transform(
		code,
		filePath,
		new PackageInfo(pluginOptions.packageInfo.name, pluginOptions.tsRootDir), // TODO: Change PackageInfo to some object; we abuse PackageInfo.rootDir to pass tsRootDir;; I don't remember what is this about
		{
			// TODO: Reflect configuration
			module: ModuleSystem.Preserve,
			runtimeGenericClasses: true,
		}
	);
}
