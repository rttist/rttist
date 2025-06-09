import type { Config } from "../config/config";
import { removeExtension } from "../transformer/utils/remove-extension";
import { relativePath, resolvePath } from "./path";

export function resolveSourceFileCachePath(filePath: string, config: Config) {
	const relativeFilePath = relativePath(config.tsRootDir, filePath);
	return `${removeExtension(resolvePath(config.cacheDir, relativeFilePath))}.ts`;
}

export function resolveMetadataCachePath(filePath: string, config: Config) {
	const relativeFilePath = relativePath(config.tsRootDir, filePath);
	return `${removeExtension(resolvePath(config.cacheDir, relativeFilePath))}.json`;
}
