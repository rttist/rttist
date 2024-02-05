import type { Plugin } from "vite";
import * as fs from "node:fs";
import { PackageInfo, transform } from "@rttist/ts-loader-wasm";

const TS_FLE_NAME_REGEX = /\.[mc]?tsx?/i;
const VUE_SCRIPT_REGEX = /<script .*>([\s\S]*)<\/script>/gi;
const METADATA_REGEX = /\/.metadata\//;
const TYPELIB_REGEX = /\/internal.typelib$/;
// const PREFIXED_METADATA_REGEX = /\u{0}\/.metadata\//u;

// SEE: https://vitejs.dev/guide/api-plugin.html

export type RttistPluginOptions = {
	packageInfo: {
		name: string;
		rootDir: string;
	};
	tsRootDir: string;
};

export function rttistPlugin(pluginOptions: RttistPluginOptions): Plugin {
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

	return {
		name: "vite-plugin-rttist",
		enforce: "pre",
		// transform(code: string, id: string) {
		// 	if (id.endsWith(".vue")) {
		// 		// TODO: This is just a super simple implementation to get it working. Should be implemented using proper parser.
		// 		code = code.replace(VUE_SCRIPT_REGEX, (_: string, code: string) => {
		// 			return transpile(code, id, pluginOptions);
		// 		});
		// 	} else if (TS_FLE_NAME_REGEX.test(id)) {
		// 		code = transpile(code, id, pluginOptions);
		// 	}
		//
		// 	return {
		// 		code,
		// 		map: null, // Prevents missing sourcemap warning
		// 	};
		// },
		// resolveId() and load() can be used for virtual modules.
		// resolveId(id: string) {
		// 	if (METADATA_REGEX.test(id)) {
		// 		return "\0" + id;
		// 	}
		// },
		// load(id: string) {
		// 	if (PREFIXED_METADATA_REGEX.test(id)) {
		// 		return `export const metadata = {}`;
		// 	}
		// },
		async load(id: string) {
			if (id.endsWith(".vue")) {
				let code = await fs.promises.readFile(id, "utf8");

				// TODO: This is just a super simple implementation to get it working. Should be implemented using proper parser.
				code = code.replace(VUE_SCRIPT_REGEX, (_: string, code: string) => {
					return transformCode(code, id, pluginOptions);
				});

				return code;
			} else if (TS_FLE_NAME_REGEX.test(id)) {
				let code = await fs.promises.readFile(id, "utf8");
				code = transformCode(code, id, pluginOptions);
				return code;
			}
		},
		config(_config, _env) {
			return {
				build: {
					rollupOptions: {
						// Mark all files from .metadata as external
						external: (id) => {
							return METADATA_REGEX.test(id) || TYPELIB_REGEX.test(id);
						},
					},
				},
			};
		},
	};
}

function transformCode(code: string, filePath: string, pluginOptions: RttistPluginOptions) {
	return transform(
		code,
		filePath,
		new PackageInfo(pluginOptions.packageInfo.name, pluginOptions.tsRootDir) // TODO: Change PackageInfo to some object; we abuse PackageInfo.rootDir to pass tsRootDir
	);
}
