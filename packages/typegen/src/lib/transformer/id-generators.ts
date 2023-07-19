/**
 * Generate a module id for a given module path.
 * @param modulePath
 * @param tsRootDir
 * @param packageName
 */
export function generateModuleId(modulePath: string, tsRootDir: string, packageName: string = "@@this") {
	let relativePath = removeExtension(modulePath.replace(/\\/g, "/")).replace(tsRootDir.replace(/\\/g, "/"), "");

	if (relativePath[0] === "/") {
		return packageName + relativePath;
	}

	return `${packageName}/${relativePath}`;
}

function removeExtension(filePath: string) {
	if (filePath.slice(-5) === ".d.ts") {
		return filePath.slice(0, -5);
	}

	const last3 = filePath.slice(-3);

	if (last3 === ".js" || last3 === ".ts") {
		return filePath.slice(0, -3);
	}

	const last4 = filePath.slice(-4);

	if (
		last4 === ".jsx" ||
		last4 === ".tsx" ||
		last4 === ".cjs" ||
		last4 === ".cts" ||
		last4 === ".mjs" ||
		last4 === ".mts"
	) {
		return filePath.slice(0, -4);
	}

	return filePath;
}
