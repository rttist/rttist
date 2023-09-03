const nativeAddon: {
	load(path: string, packageInfo: PackageInfo): string;
	transform(code: string, path: string, packageInfo: PackageInfo): string;
} = require("../native/index.node");

/**
 * Loads a file from the file system and returns code compatible with the RTTIST reflection.
 * @param path
 * @param packageInfo
 */
export function load(path: string, packageInfo: PackageInfo): string {
	return nativeAddon.load(path, packageInfo);
}

/**
 * Transforms the code to be compatible with the RTTIST reflection.
 * @param code
 * @param path
 * @param packageInfo
 */
export function transform(code: string, path: string, packageInfo: PackageInfo): string {
	return nativeAddon.transform(code, path, packageInfo);
}

export class PackageInfo {
	constructor(
		private readonly name: string,
		private readonly rootDir: string
	) {}
}
