import { Config } from "../config/config";
import { relativePath, resolvePath } from "./path";

export function resolveSourceFileCachePath(filePath: string, config: Config) {
	const relativeFilePath = relativePath(config.tsRootDir, filePath); // TODO: Should be probably relative to TS rootDir
	return resolvePath(config.cacheDir, relativeFilePath);
}
