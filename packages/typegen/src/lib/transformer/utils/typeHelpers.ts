import * as ts from "typescript";

/**
 * If the given type is some kind of alias or something which we don't want to reflect, find the right type.
 * @param type
 */
export function resolveType(type: ts.Type): ts.Type {
	if (isReference(type)) {
		return type.target;
	}

	// TODO: Implement; maybe the logic replacing true | false union for boolean etc.
	return type;
}

/**
 * @desc If the type is a reference, it is usually a sub type of generic type definition.
 * @param type
 */
export function isReference(type: ts.Type): type is ts.TypeReference {
	return isObject(type) && (type.objectFlags & ts.ObjectFlags.Reference) !== 0;
}

export function isObject(type: ts.Type): type is ts.ObjectType {
	return (type.flags & ts.TypeFlags.Object) !== 0;
}

export function getSymbol(type: ts.Type, typeChecker: ts.TypeChecker): ts.Symbol | undefined {
	const symbol = ((type.aliasSymbol?.flags || 0) & ts.SymbolFlags.TypeAlias) !== 0 ? type.aliasSymbol : type.symbol;

	if (symbol === undefined) {
		return undefined;
	}

	// TODO: What is alias? It's not TypeAlias. Do we want to follow aliases?
	if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
		return typeChecker.getAliasedSymbol(symbol);
	}

	return symbol;
}

export function getMajorTypeFlag(type: ts.Type) {
	// Boolean is Boolean | (true | false)
	if ((type.flags & ts.TypeFlags.Boolean) !== 0) {
		return ts.TypeFlags.Boolean;
	}
	if ((type.flags & ts.TypeFlags.Enum) !== 0) {
		return ts.TypeFlags.Enum;
	}

	return type.flags;
}

// export function getTypeId(
// 	type: ts.Type,
// 	nullable: boolean,
// 	symbol: ts.Symbol | undefined,
// 	transformerContext: TransformerContext
// ): TypeIdentifier {
// 	return getTypeRef(type, nullable, symbol, transformerContext).id || TypeIds.Invalid;
// }

export function isInvalidType(
	type: ts.Type | undefined | { intrinsicName: "error" }
): type is undefined | { intrinsicName: "error" } {
	return type === undefined || (type as any).intrinsicName === "error";
}

export function hasTypeArguments(type: ts.Type): type is ts.Type & { resolvedTypeArguments: readonly ts.Type[] } {
	return (type as any).resolvedTypeArguments !== undefined;
}

const KindsWithInitializer = new Set([
	ts.SyntaxKind.VariableDeclaration,
	ts.SyntaxKind.Parameter,
	ts.SyntaxKind.BindingElement,
	ts.SyntaxKind.PropertyDeclaration,
	ts.SyntaxKind.PropertyAssignment,
	// ts.SyntaxKind.PropertySignature, // TODO: Review why this has initializer no more.
	ts.SyntaxKind.JsxAttribute,
	ts.SyntaxKind.EnumMember,
]);

export function isVariableLikeDeclarationWithInitializer(declaration: ts.Node): declaration is
	| ts.VariableDeclaration
	| ts.ParameterDeclaration
	| ts.BindingElement
	| ts.PropertyDeclaration
	| ts.PropertyAssignment
	// | ts.PropertySignature
	| ts.JsxAttribute
	| ts.EnumMember {
	return KindsWithInitializer.has(declaration.kind);
}

export function getUniqueSymbolName(type: ts.Type): string | undefined {
	let name: string | undefined = (type as any).escapedName;

	if (name) {
		name = name.toString();
		let firstAt = name.indexOf("@");
		let lastAt = name.lastIndexOf("@");
		name = name.slice(firstAt + 1, lastAt);
	}

	return name;
}

const LiteralFlags = ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BigIntLiteral;

export function isLiteral(type: ts.Type): type is ts.LiteralType {
	return (type.flags & LiteralFlags) !== 0;
}

export function toBigIntLiteral(value: ts.PseudoBigInt) {
	return (value.negative ? "-" : "") + value.base10Value + "n";
}
