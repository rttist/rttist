import { ModuleIds, TypeIds } from "@rttist/core";
import { ModuleIdentifier, TypeIdentifier } from "rttist";
import { NamedDeclaration } from "typescript";
import * as ts from "typescript";
import { Config } from "../config/config";
import { normalizePath, resolvePath } from "../utils/path";
import { Scope } from "./scopes/scope";
import { isDeclaration } from "./utils/is-declaration";
import { isNamedDeclaration } from "./utils/is-named-declaration";
import { getModifiers } from "./utils/modifier-helpers";
import { isLiteral } from "./utils/typeHelpers";

/**
 * Generate a module id for a given module path.
 * @param modulePath
 * @param tsRootDir
 * @param packageName
 */
export function generateSourceFileModuleId(
	modulePath: string,
	tsRootDir: string,
	packageName: string = "@@this"
): ModuleIdentifier {
	let relativePath = removeExtension(modulePath.replace(/\\/g, "/")).replace(tsRootDir.replace(/\\/g, "/"), "");

	if (relativePath[0] === "/") {
		return packageName + relativePath;
	}

	return `${packageName}/${relativePath}`;
}

/**
 * Generate a module id for a given module path.
 * @param sourceFilePath
 * @param importSpecifier
 * @param config
 */
export function generateImportedModuleId(
	sourceFilePath: string,
	importSpecifier: string,
	config: Config
): ModuleIdentifier {
	// Local file
	if (importSpecifier[0] === ".") {
		return generateSourceFileModuleId(
			resolvePath(sourceFilePath, importSpecifier),
			config.tsRootDir,
			config.packageInfo.name
		);
	}
	// Probably alias
	else if (importSpecifier[0] === "@") {
		// TODO: Handle alias
	}

	// else Package
	return "@" + normalizePath(removeExtension(importSpecifier));
}

// Mapping name of types and TS node kinds to Typ identifiers
const wellKnownType = new Map<string | number, string>([
	["object", TypeIds.NonPrimitiveObject],
	[ts.SyntaxKind.ObjectKeyword, TypeIds.NonPrimitiveObject],
	["any", TypeIds.Any],
	[ts.SyntaxKind.AnyKeyword, TypeIds.Any],
	["unknown", TypeIds.Unknown],
	[ts.SyntaxKind.UnknownKeyword, TypeIds.Unknown],
	["void", TypeIds.Void],
	[ts.SyntaxKind.VoidKeyword, TypeIds.Void],
	["never", TypeIds.Never],
	[ts.SyntaxKind.NeverKeyword, TypeIds.Never],
	["null", TypeIds.Null],
	[ts.SyntaxKind.NullKeyword, TypeIds.Null],
	["undefined", TypeIds.Undefined],
	[ts.SyntaxKind.UndefinedKeyword, TypeIds.Undefined],
	["String", TypeIds.String],
	[ts.SyntaxKind.StringKeyword, TypeIds.String],
	["Number", TypeIds.Number],
	[ts.SyntaxKind.NumberKeyword, TypeIds.Number],
	["BigInt", TypeIds.BigInt],
	[ts.SyntaxKind.BigIntKeyword, TypeIds.BigInt],
	["Boolean", TypeIds.Boolean],
	[ts.SyntaxKind.BooleanKeyword, TypeIds.Boolean],
	["true", TypeIds.True],
	[ts.SyntaxKind.TrueKeyword, TypeIds.True],
	["false", TypeIds.False],
	[ts.SyntaxKind.FalseKeyword, TypeIds.False],
	["Date", TypeIds.Date],
	["Error", TypeIds.Error],
	["Symbol", TypeIds.Symbol],
	[ts.SyntaxKind.SymbolKeyword, TypeIds.Symbol],
	["UniqueSymbol", TypeIds.UniqueSymbol],
	["RegExp", TypeIds.RegExp],
	["Int8Array", TypeIds.Int8Array],
	["Uint8Array", TypeIds.Uint8Array],
	["Uint8ClampedArray", TypeIds.Uint8ClampedArray],
	["Int16Array", TypeIds.Int16Array],
	["Uint16Array", TypeIds.Uint16Array],
	["Int32Array", TypeIds.Int32Array],
	["Uint32Array", TypeIds.Uint32Array],
	["Float32Array", TypeIds.Float32Array],
	["Float64Array", TypeIds.Float64Array],
	["BigInt64Array", TypeIds.BigInt64Array],
	["BigUint64Array", TypeIds.BigUint64Array],
	["ArrayDefinition", TypeIds.ArrayDefinition],
	["ReadonlyArray", TypeIds.ReadonlyArrayDefinition],
	["Map", TypeIds.MapDefinition],
	["WeakMap", TypeIds.WeakMapDefinition],
	["Set", TypeIds.SetDefinition],
	["WeakSet", TypeIds.WeakSetDefinition],
	["Promise", TypeIds.PromiseDefinition],
	["Generator", TypeIds.GeneratorDefinition],
	["AsyncGenerator", TypeIds.AsyncGeneratorDefinition],
	["Iterator", TypeIds.IteratorDefinition],
	["Iterable", TypeIds.IterableDefinition],
	["IterableIterator", TypeIds.IterableIteratorDefinition],
	["AsyncIterator", TypeIds.AsyncIteratorDefinition],
	["AsyncIterable", TypeIds.AsyncIterableDefinition],
	["AsyncIterableIterator", TypeIds.AsyncIterableIteratorDefinition],
	["ArrayBuffer", TypeIds.ArrayBuffer],
	["SharedArrayBuffer", TypeIds.SharedArrayBuffer],
	["Atomics", TypeIds.Atomics],
	["DataView", TypeIds.DataView],
]);

/**
 * Return TypeIdentifier or undefined in case it is not possible to generate the name (eg. unsupported syntax; missing implementation).
 * @param moduleId
 * @param node
 * @param scope
 */
export function generateTypeId(node: ts.Node, moduleId: ModuleIdentifier, scope: Scope): TypeIdentifier | undefined {
	// First keywords,
	const knownType = wellKnownType.get(node.kind);
	if (knownType) {
		return knownType;
	}

	// other well-known

	// literals,
	const literalType = getLiteralTypeIdentifier(node);
	if (literalType) {
		return literalType;
	}

	// // variables from scope
	// if (ts.isTypeReferenceNode(node)) {
	// 	const identifier = scope.getDeclaration(node.typeName.getText());
	// 	if (identifier) {
	//
	// 	}
	// }
	//
	// // variables from scope
	// if (ts.isIdentifier(node)) {
	// 	const identifier = scope.getDeclaration(node.text);
	// 	if (identifier) {
	// 	}
	// }

	// If it's named declaration, build the path up to the SourceFile
	if (isDeclaration(node)) {
		if (isNamedDeclaration(node)) {
			let name = "";
			let itNode: ts.Node | undefined = node;

			do {
				if (isDeclaration(itNode) && isNamedDeclaration(itNode)) {
					let separator = ".";

					if (ts.isClassLike(itNode.parent) && ts.canHaveModifiers(itNode)) {
						const modifiers = getModifiers(itNode);

						if (modifiers.static) {
							separator = "#";
						}
					}

					name = (itNode.name.getText() ?? "") + (name ? "." + name : "");
				}
				itNode = itNode.parent;
			} while (itNode && !ts.isSourceFile(itNode));

			return moduleId + ":" + name;
		}
	}

	return undefined;
}

export const MainConst = class {
	prop: number = 0;

	static readonly StaticFiled = class ClassUnderStaticFiled {
		prop: number = 0;

		constructor() {
			console.log(ClassUnderStaticFiled, MainConst.StaticFiled);
		}
	};

	constructor() {
		console.log(MainConst.StaticFiled);
	}
};

// function getPathToSourceFile(node: ts.Node) {}

function getLiteralTypeIdentifier(node: ts.Node): TypeIdentifier | undefined {
	if (!ts.isLiteralExpression(node)) {
		return undefined;
	}

	let val;
	switch (node.kind) {
		case ts.SyntaxKind.StringLiteral:
			val = `'${node.text}'`;
			break;
		default:
			val = node.text;
			break;
	}

	return `#Literal(${val})`;
}

function toBigIntLiteral(value: ts.PseudoBigInt) {
	return (value.negative ? "-" : "") + value.base10Value + "n";
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
