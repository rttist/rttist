import { Config } from "../config/config";
import { relativePath, resolvePath } from "./path";

export function resolveSourceFileCachePath(filePath: string, config: Config) {
	const relativeFilePath = relativePath(config.tsRootDir, filePath);
	return resolvePath(config.cacheDir, relativeFilePath);
}
