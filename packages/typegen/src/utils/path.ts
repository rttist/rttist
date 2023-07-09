import path from "path";
import * as $path from "path";

export function dirname(path: string) {
	return $path.dirname(path);
}

export function resolvePath(...paths: string[]) {
	return $path.resolve(...paths);
}

export function normalizePath(pathToNormalize: string) {
	return path.normalize(pathToNormalize).replace(/\\/g, "/");
}
