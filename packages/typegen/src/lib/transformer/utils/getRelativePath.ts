import * as path from "path";

// TODO: Remove
export function getRelativePath(source: string, destination: string): string {
	let relativePath = path.relative(source, destination).replace(/\\/g, "/");

	if (relativePath.charAt(0) !== ".") {
		relativePath = "./" + relativePath;
	}

	return relativePath;
}
