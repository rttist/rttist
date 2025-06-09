// import * as fs from "node:fs";
// import { IncrementalGenerator } from "./incremental-generator";
// import { FsCachedStorage } from "./lib/cache/fs-cached-storage";
// import { getParsedConfig } from "./lib/config/config";
// import { Logger } from "./lib/logging";
// import { LogBuffer } from "./lib/logging/log-buffer";
//
// type RttistPluginOptions = {
// 	packageInfo: {
// 		name: string;
// 		rootDir: string;
// 	};
// 	projectRoot: string;
// 	// tsRootDir: string;
// 	/**
// 	 * The directory where the metadata files will be written to. This should match the `metadata.ourDir` option from your reflect.config file.
// 	 */
// 	metadataOutDir: string;
// };
//
// export async function rttistPlugin(pluginOptions: RttistPluginOptions): Promise<void> {
// 	const logger = new Logger("vite-plugin-rttist", undefined, LogBuffer.autoFlush);
// 	// const config = await getParsedConfig({
// 	// 	typecheck: true,
// 	// 	watch: true,
// 	// 	force: true,
// 	// 	projectRoot: pluginOptions.tsRootDir,
// 	// });
// 	const incrementalGenerator = await IncrementalGenerator.create(
// 		logger,
// 		new FsCachedStorage(),
// 		new FsCachedStorage(),
// 		{
// 			projectRoot: pluginOptions.projectRoot,
// 			force: true,
// 		}
// 	);
//
// 	function resolveId(id: string) {
// 		// if (id === "rttist/typelib" || id === "virtual:typelib") {
// 		// 	return VIRTUAL_TYPELIB_RESOLVE_ID;
// 		// }
// 		//
// 		// if (id === "virtual:internal.typelib") {
// 		// 	return VIRTUAL_INTERNAL_TYPELIB_RESOLVE_ID;
// 		// }
// 	}
//
// 	function configureServer(server) {
// 		// const [metadataUrl, metadataModuleNode] =
// 		// 	Array.from(server.moduleGraph.urlToModuleMap.entries()).find(([url, module]) =>
// 		// 		url.endsWith("/metadata.typelib.ts")
// 		// 	) ?? [];
// 		// // server.moduleGraph.getModuleByUrl(met);
// 		// // server.moduleGraph.updateModuleInfo(metadataModuleNode);
// 		// console.log(metadataUrl, metadataModuleNode);
// 	}
//
// 	function buildStart(options: unknown) {
// 		incrementalGenerator.generate();
// 		// rttistGenerator = new RttistGeneratorApi();
// 	}
//
// 	function handleHotUpdate(ctx) {
// 		if (typelibModule === undefined) {
// 			typelibModule = ctx.server.moduleGraph.getModuleById(VIRTUAL_TYPELIB_RESOLVE_ID) ?? null;
// 		}
//
// 		if (internalTypelibModule === undefined) {
// 			internalTypelibModule = ctx.server.moduleGraph.getModuleById(VIRTUAL_INTERNAL_TYPELIB_RESOLVE_ID) ?? null;
// 		}
//
// 		const invalidatedModules = new Set<ModuleNode>();
//
// 		// When any file gets updated, we should invalidate typelibs
// 		// MAYDO: can be optimized for files that contains no types, classes, functions etc. impacting typelibs
// 		if (typelibModule !== null) {
// 			ctx.server.moduleGraph.invalidateModule(typelibModule, invalidatedModules, ctx.timestamp, true);
// 		}
//
// 		if (internalTypelibModule !== null) {
// 			ctx.server.moduleGraph.invalidateModule(internalTypelibModule, invalidatedModules, ctx.timestamp, true);
// 		}
//
// 		// // Check dependencies if it contains typelib
// 		// const invalidatedModules = new Set<ModuleNode>();
// 		//
// 		// for (const mod of ctx.modules) {
// 		// 	ctx.server.moduleGraph.invalidateModule(mod, invalidatedModules, ctx.timestamp, true);
// 		// }
//
// 		// ctx.server.hot.send({ type: 'full-reload' })
//
// 		return [];
// 	}
//
// 	async function load(id: string) {
// 		if (id === VIRTUAL_TYPELIB_RESOLVE_ID) {
// 		}
//
// 		// 			// TODO: This is way how to handle HMR of metadata.typelib; we can rewrite types in global type lib
// 		// 			if (viteCommand === "serve" && id.endsWith("/metadata.typelib.ts")) {
// 		// 				return (
// 		// 					(await fs.promises.readFile(id, "utf8")) +
// 		// 					`
// 		// if (import.meta.hot) {
// 		// 	import.meta.hot.accept(["rttist", "./internal.typelib"]);
// 		// 	// import.meta.hot.on("vite:beforeUpdate", () => {
// 		// 	// 	Metadata.clearMetadata();
// 		// 	// });
// 		// 	// import.meta.hot.accept();
// 		// }`
// 		// 				);
// 		// 			}
//
// 		// // Read internal.typelib from disk
// 		// if (PREFIXED_TYPELIB_REGEX.test(id)) {
// 		// 	const internalTypelibPath = resolve(pluginOptions.metadataOutDir, "internal.typelib.js");
// 		// 	return await fs.promises.readFile(internalTypelibPath, "utf8");
// 		// }
//
// 		// Handle .vue files -> transform only the TYPESCRIPT part
// 		if (id.endsWith(".vue")) {
// 			let code = await fs.promises.readFile(id, "utf8");
//
// 			// TODO: This is just a super simple implementation to get it working. Should be implemented using proper parser.
// 			code = code.replace(VUE_SCRIPT_REGEX, (_: string, code: string) => {
// 				return transformCode(code, id, pluginOptions);
// 			});
//
// 			return code;
// 		}
//
// 		// Transform all TS files
// 		if (TS_FILE_NAME_REGEX.test(id)) {
// 			let code = await fs.promises.readFile(id, "utf8");
// 			code = transformCode(code, id, pluginOptions);
// 			return code;
// 		}
// 	}
// }
