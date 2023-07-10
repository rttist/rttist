import type { Plugin } from "vite";

const TS_FLE_NAME_REGEX = /\.[mc]?tsx?/i;
const VUE_SCRIPT_REGEX = /<script .*>([\s\S]*)<\/script>/gi;
const METADATA_REGEX = /\/.metadata\//;
const PREFIXED_METADATA_REGEX = /\u{0}\/.metadata\//u;

// SEE: https://vitejs.dev/guide/api-plugin.html

export function rttist(): Plugin {
	return {
		name: "vite-plugin-rttist",
		enforce: "pre",
		transform(code: string, id: string) {
			if (id.endsWith(".vue")) {
				// TODO: This is just a super simple implementation to get it working. Should be implemented using proper parser.
				code = code.replaceAll(VUE_SCRIPT_REGEX, (_: string, code: string) => {
					return transform(code);
				});
			} else if (TS_FLE_NAME_REGEX.test(id)) {
				code = transform(code);
			}

			return {
				code,
				map: null, // Prevents missing sourcemap warning
			};
		},
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
		config(_config, _env) {
			return {
				build: {
					rollupOptions: {
						// Mark all files from .metadata as external
						external: (id) => {
							return METADATA_REGEX.test(id);
						},
					},
				},
			};
		},
	};
}

function transform(code: string) {
	// TODO: Implement
	return code;
}
