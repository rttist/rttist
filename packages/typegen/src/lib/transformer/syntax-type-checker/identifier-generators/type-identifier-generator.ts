import { TypeIds } from "@rttist/core";
import { ModuleIdentifier, TypeIdentifier } from "rttist";
import * as ts from "typescript";
import { Config } from "../../../config/config";
import { getTopLevelIdentifier } from "../../utils/get-top-level-identifier";
import { getTopLevelTypeName } from "../../utils/get-top-level-type-name";
import { isDeclaration } from "../../utils/is-declaration";
import { isNamedDeclaration } from "../../utils/is-named-declaration";
import { getModifiers } from "../../utils/modifier-helpers";
import { DeclarationInfo, ImportDeclarationInfo, InfoKind, TypeDeclarationInfo } from "../scopes/scope";
import { ScopeManager } from "../scopes/scope-manager";

// Mapping name of types and TS node kinds to Typ identifiers
export const wellKnownType = new Map<string | number, string>([
	["object", TypeIds.NonPrimitiveObject],
	[ts.SyntaxKind.ObjectKeyword, TypeIds.NonPrimitiveObject],
	["Function", TypeIds.Function],
	["any", TypeIds.Any],
	[ts.SyntaxKind.AnyKeyword, TypeIds.Any],
	["unknown", TypeIds.Unknown],
	[ts.SyntaxKind.UnknownKeyword, TypeIds.Unknown],
	["void", TypeIds.Void],
	[ts.SyntaxKind.VoidKeyword, TypeIds.Void],
	["intrinsic", TypeIds.Intrinsic],
	[ts.SyntaxKind.IntrinsicKeyword, TypeIds.Intrinsic],
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
	["Array", TypeIds.ArrayDefinition],
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

export class TypeIdentifierGenerator {
	private readonly identifiersMap = new WeakMap<ts.Node, TypeIdentifier>();

	constructor(
		private readonly scopeManager: ScopeManager,
		private readonly config: Config
	) {}

	generateTypeIdentifier(node: ts.Node, valueContext: boolean): TypeIdentifier | undefined {
		if (this.config.devMode) {
			TypegenDebugger.generatingIdFor = node;
		}

		if (ts.isLiteralTypeNode(node)) {
			node = node.literal;
		}

		// Keywords
		const knownType = wellKnownType.get(node.kind);
		if (knownType) {
			return knownType;
		}

		// Literals
		const literalType = getLiteralTypeIdentifier(node, valueContext);
		if (literalType) {
			return literalType;
		}

		const existing = this.identifiersMap.get(node);

		if (existing) {
			return existing;
		}

		if (ts.isArrayTypeNode(node)) {
			const type = this.createTypeArgumentsTypeId(TypeIds.ArrayDefinition, [node.elementType], valueContext);
			this.identifiersMap.set(node, type);
			return type;
		}

		if (ts.isTupleTypeNode(node)) {
			const type = this.createTypeArgumentsTypeId(TypeIds.TupleDefinition, node.elements, valueContext);
			this.identifiersMap.set(node, type);
			return type;
		}

		if (ts.isUnionTypeNode(node)) {
			return `#|{${node.types.map((typeNode) => this.generateTypeIdentifier(typeNode, false)).join(",")}}`;
		}

		if (ts.isIntersectionTypeNode(node)) {
			return `#&{${node.types.map((typeNode) => this.generateTypeIdentifier(typeNode, false)).join(",")}}`;
		}

		if (ts.isTypeParameterDeclaration(node)) {
			return `${this.generateTypeIdentifier(node.parent, false)}:${node.name.text}`;
		}

		const scope = this.scopeManager.getClosestScope(node);
		const moduleId = scope.moduleScope.id;

		if (ts.isTypeLiteralNode(node)) {
			return `${moduleId}:$${node.pos}`;
		}

		// Type referenced from scope
		if (ts.isTypeReferenceNode(node)) {
			const topLevelIdentifier = getTopLevelTypeName(node.typeName);

			if (topLevelIdentifier) {
				// TODO: Change scope.getTypeDefinition. Make some kind of custom TypeChecker/Manager/registry that will return type and it's scope. Because it may be declaration from another file. Getting from another file from current scope seems weird. If the target module does not have scope, we have to create one, it means we have to parse that mdule and scope ModuleInfo on the SourceFile.
				const declaration = scope.getTypeDeclaration(topLevelIdentifier.text);
				let typeId: string | undefined;

				if (declaration) {
					typeId = this.createTypeNameDeclarationTypeId(node.typeName, moduleId, declaration);
				}

				const knownType = wellKnownType.get((node.typeName as ts.Identifier).escapedText + "");
				if (knownType) {
					typeId = knownType;
				}

				if (typeId !== undefined) {
					if (node.typeArguments !== undefined) {
						const type = this.createTypeArgumentsTypeId(typeId, node.typeArguments, valueContext);
						this.identifiersMap.set(node, type);
						return type;
					}
					this.identifiersMap.set(node, typeId);
					return typeId;
				}
			}

			return TypeIds.Invalid;
		}

		// If it's typeof something
		if (ts.isTypeQueryNode(node)) {
			const topLevelIdentifier = getTopLevelTypeName(node.exprName);

			if (topLevelIdentifier) {
				const declaration = scope.getTypeDeclaration(topLevelIdentifier.text);

				if (declaration) {
					const type = this.createTypeNameDeclarationTypeId(node.exprName, moduleId, declaration);
					this.identifiersMap.set(node, type);
					return type;
				}
			}

			return TypeIds.Invalid;
		}

		// Identifier from scope
		if (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) {
			const topLevelIdentifier = ts.isIdentifier(node) ? node : getTopLevelIdentifier(node);

			if (topLevelIdentifier) {
				const declaration = scope.getDeclaration(topLevelIdentifier.text);

				if (declaration) {
					const type = createIdentifierDeclarationTypeId(node, moduleId, declaration);
					this.identifiersMap.set(node, type);
					return type;
				}

				const knownType = wellKnownType.get(topLevelIdentifier.escapedText + "");
				if (knownType) {
					this.identifiersMap.set(node, knownType);
					return knownType;
				}
			}

			return TypeIds.Invalid;
		}

		// If it's named declaration, build the path up to the SourceFile
		if (isDeclaration(node) || ts.isClassExpression(node) || ts.isFunctionExpression(node)) {
			// if (isNamedDeclaration(node)) {
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

					name = (itNode.name.getText() ?? "") + (name ? separator + name : "");
				}
				itNode = itNode.parent;
			} while (itNode && !ts.isSourceFile(itNode));

			const type = moduleId + ":" + name;
			this.identifiersMap.set(node, type);
			return type;
			// }
		}

		if (ts.isNewExpression(node)) {
			return this.generateTypeIdentifier(node.expression, valueContext);
		}

		if (ts.isAsExpression(node)) {
			// `x as const`
			if (
				ts.isTypeReferenceNode(node.type) &&
				ts.isIdentifier(node.type.typeName) &&
				node.type.typeName.escapedText === "const"
			) {
				return this.generateTypeIdentifier(node.expression, false);
			}

			return this.generateTypeIdentifier(node.type, valueContext);
		}

		if (ts.isExpressionWithTypeArguments(node)) {
			const genericTypeDefinition = this.generateTypeIdentifier(node.expression, valueContext);
			// TODO: We have to generate Id for this specific generic type; but we have to add this type to metadata also.
			return (
				genericTypeDefinition +
				(node.typeArguments === undefined
					? ""
					: `{${node.typeArguments.map((ta) => this.generateTypeIdentifier(ta, false)).join(",")}}`)
			);
			// // TODO: This is temporary for prototype
			// return genericTypeDefinition;
		}

		return undefined;
	}

	private createTypeArgumentsTypeId(
		typeId: string,
		typeArguments: ts.NodeArray<ts.TypeNode> | Array<ts.TypeNode>,
		valueContext: boolean
	): TypeIdentifier {
		return (
			typeId +
			"{" +
			typeArguments.map((typeArgument) => this.generateTypeIdentifier(typeArgument, valueContext)).join(",") +
			"}"
		);
	}

	private createTypeNameDeclarationTypeId(
		node: ts.Identifier | ts.QualifiedName,
		moduleId: ModuleIdentifier,
		declaration: TypeDeclarationInfo | ImportDeclarationInfo
	): TypeIdentifier {
		switch (declaration.kind) {
			case InfoKind.AnyTypeDeclaration:
			case InfoKind.TypeParameterDeclaration:
				if (ts.isTypeParameterDeclaration(declaration.declaration)) {
					return this.generateTypeIdentifier(declaration.declaration, false) ?? TypeIds.Invalid;
				}

				return moduleId + ":" + serializeTypePath(node, false);
			case InfoKind.ImportDeclaration:
				if (declaration.namespaceImport) {
					return declaration.moduleId + ":" + serializeTypePath(node, true);
				} else {
					return declaration.moduleId + ":" + declaration.declaredName;
				}
		}
	}
}

function createIdentifierDeclarationTypeId(
	node: ts.Identifier | ts.PropertyAccessExpression,
	moduleId: ModuleIdentifier,
	declaration: DeclarationInfo | ImportDeclarationInfo
): TypeIdentifier {
	switch (declaration.kind) {
		case InfoKind.NamedDeclaration:
			return moduleId + ":" + serializePath(node, false);
		case InfoKind.ImportDeclaration:
			if (declaration.namespaceImport) {
				return declaration.moduleId + ":" + serializePath(node, true);
			} else {
				return declaration.moduleId + ":" + declaration.declaredName;
			}
	}
}

function serializePath(node: ts.Identifier | ts.PropertyAccessExpression, skipRootIdentifier: boolean): string {
	let path = "";
	let nested: ts.LeftHandSideExpression = node;

	while (ts.isPropertyAccessExpression(nested)) {
		path = nested.name.text + "." + path;

		if (!skipRootIdentifier && ts.isIdentifier(nested.expression)) {
			path = nested.expression.text + "." + path;
			break;
		}

		nested = nested.expression;
	}

	return path + (ts.isIdentifier(node) ? node.text : node.name.text);
}

function serializeTypePath(node: ts.Identifier | ts.QualifiedName, skipRootIdentifier: boolean): string {
	let path = "";
	let nested: ts.EntityName = node;

	while (ts.isQualifiedName(nested)) {
		path = nested.right.text + "." + path;

		if (!skipRootIdentifier && ts.isIdentifier(nested.left)) {
			path = nested.left.text + "." + path;
			break;
		}

		nested = nested.left;
	}

	return path + (ts.isIdentifier(node) ? node.text : node.right.text);
}

function getLiteralTypeIdentifier(node: ts.Node, valueContext: boolean): TypeIdentifier | undefined {
	if (!ts.isLiteralExpression(node)) {
		return undefined;
	}

	if (valueContext) {
		switch (node.kind) {
			case ts.SyntaxKind.StringLiteral:
				return TypeIds.String;
			case ts.SyntaxKind.NumericLiteral:
				return TypeIds.Number;
			case ts.SyntaxKind.BigIntLiteral:
				return TypeIds.BigInt;
			case ts.SyntaxKind.JsxText:
				return TypeIds.String; // TODO: JSX
			case ts.SyntaxKind.JsxTextAllWhiteSpaces:
				return TypeIds.String; // TODO: JSX
			case ts.SyntaxKind.RegularExpressionLiteral:
				return TypeIds.RegExp;
			case ts.SyntaxKind.NoSubstitutionTemplateLiteral: // TODO: Is this ok?
				return TypeIds.String;
		}
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

	return `#L(${val})`;
}
