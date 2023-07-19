import * as $path from "path";

export function dirname(path: string) {
	return $path.dirname(path);
}

export function resolvePath(...paths: string[]) {
	return $path.resolve(...paths);
}

export function joinPaths(...paths: string[]) {
	return $path.join(...paths);
}

export function normalizePath(pathToNormalize: string) {
	return $path.normalize(pathToNormalize).replace(/\\/g, "/");
}

export function relativePath(from: string, to: string) {
	return $path.relative(from, to);
}
