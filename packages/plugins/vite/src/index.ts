import type { Plugin } from "vite";

const TS_FLE_NAME_REGEX = /\.[mc]?tsx?/i;
const VUE_SCRIPT_REGEX = /<script .*>([\s\S]*)<\/script>/gi;

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
	};
}

function transform(code: string) {
	// TODO: Implement
	return code;
}
