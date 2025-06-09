import * as $path from "path";
import type { Config } from "../config/config";
import { removeExtension } from "../transformer/utils/remove-extension";

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

/**
 * Normalizes path and resolve correct file extension according to intended target file type (JS | TS) and TS configuration
 * @param filePath
 * @param target
 * @param config
 */
export function correctPath(filePath: string, target: "js" | "ts", config: Config) {
	filePath = normalizePath(filePath);

	if (config.explicitFileExtensions) {
		return `${removeExtension(filePath)}.${resolveExtension(
			filePath,
			target === "ts" && (config.compilerOptions.allowImportingTsExtensions ?? false)
		)}`;
	}

	return removeExtension(filePath);
}

function resolveExtension(filePath: string, useTsExtension: boolean) {
	const last3 = filePath.slice(-3);

	if (last3 === ".js" || last3 === ".ts") {
		return useTsExtension ? "ts" : "js";
	}

	const last4 = filePath.slice(-4);

	switch (last4) {
		case ".jsx":
			return "jsx";
		case ".cjs":
			return "cjs";
		case ".mjs":
			return "mjs";
		case ".tsx":
			return useTsExtension ? "tsx" : "jsx";
		case ".cts":
			return useTsExtension ? "cts" : "cjs";
		case ".mts":
			return useTsExtension ? "mts" : "mjs";
	}

	return useTsExtension ? "ts" : "js";
}
