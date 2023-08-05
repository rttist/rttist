import * as path from "path";
import { ModuleIdentifier } from "rttist";
import * as ts from "typescript";
import { Config } from "../../../config/config";

export class ModuleIdentifierGenerator {
	constructor(private readonly config: Config) {}

	/**
	 * Generate a module id for a given module path.
	 * @param modulePath
	 */
	generateModuleIdentifier(modulePath: string): ModuleIdentifier {
		let relativePath = removeExtension(modulePath.replace(/\\/g, "/")).replace(
			this.config.tsRootDir.replace(/\\/g, "/"),
			""
		);

		if (relativePath[0] === "/") {
			return "@" + this.config.packageInfo.name + relativePath;
		}

		return `@${this.config.packageInfo.name}/${relativePath}`;
	}

	/**
	 * Generate a module id for a given module path.
	 * @param modulePath
	 * @param importDeclaration
	 */
	generateImportedModuleIdentifier(modulePath: string, importDeclaration: ts.ImportDeclaration): ModuleIdentifier {
		const specifier = (importDeclaration.moduleSpecifier as unknown as ts.StringLiteral).text;

		// Local file
		if (specifier[0] === ".") {
			return this.generateModuleIdentifier(path.resolve(path.dirname(modulePath), specifier));
		}
		// Probably alias
		else if (specifier[0] === "@") {
			// TODO: Handle alias
		}

		// else Package
		return "@" + normalizePath(removeExtension(specifier));
	}
}

export function normalizePath(pathToNormalize: string) {
	return path.normalize(pathToNormalize).replace(/\\/g, "/");
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
