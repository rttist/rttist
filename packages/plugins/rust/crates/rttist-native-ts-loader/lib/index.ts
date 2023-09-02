const nativeAddon: {
	load(path: string): string;
	transform(code: string, path: string): string;
} = require("../native/index.node");

/**
 * Loads a file from the file system and returns code compatible with the RTTIST reflection.
 * @param path
 */
export function load(path: string): string {
	return nativeAddon.load(path);
}

/**
 * Transforms the code to be compatible with the RTTIST reflection.
 * @param code
 * @param path
 */
export function transform(code: string, path: string): string {
	return nativeAddon.transform(code, path);
}
