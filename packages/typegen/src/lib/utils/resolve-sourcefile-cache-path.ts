import { Config } from "../config/config";
import { removeExtension } from "../transformer/utils/removeExtension";
import { relativePath, resolvePath } from "./path";

export function resolveSourceFileCachePath(filePath: string, config: Config) {
	const relativeFilePath = relativePath(config.tsRootDir, filePath);
	return removeExtension(resolvePath(config.cacheDir, relativeFilePath)) + ".ts";
}
