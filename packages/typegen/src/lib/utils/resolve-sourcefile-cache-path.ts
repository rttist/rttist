import type { Config } from "../config/config";
import { removeExtension } from "../transformer/utils/remove-extension";
import { relativePath, resolvePath } from "./path";

/**
 * Returns absolute path to the metadata TS cache file for the given source file. Path is not project normalized.
 * @param filePath
 * @param config
 */
export function resolveSourceFileCachePath(filePath: string, config: Config) {
	const relativeFilePath = relativePath(config.tsRootDir, filePath);
	return `${removeExtension(resolvePath(config.cacheDir, relativeFilePath))}.ts`;
}

/**
 * Returns absolute path to the metadata cache file for the given source file. Path is not project normalized.
 * @param filePath
 * @param config
 */
export function resolveMetadataCachePath(filePath: string, config: Config) {
	// Get relative path from TS's rootDir to the filePath
	const relativeFilePath = relativePath(config.tsRootDir, filePath);
	// Apply this relative path to the cache directory
	return `${removeExtension(resolvePath(config.cacheDir, relativeFilePath))}.json`;
}
