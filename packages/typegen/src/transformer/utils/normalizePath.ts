import path from "path";

export function normalizePath(pathToNormalize: string) {
	return path.normalize(pathToNormalize).replace(/\\/g, "/");
}
