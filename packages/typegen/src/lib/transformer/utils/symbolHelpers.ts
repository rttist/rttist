import * as ts from "typescript";

/**
 * Returns declaration of symbol. ValueDeclaration is preferred.
 * @param symbol
 */
export function getDeclaration<TDeclaration extends ts.Declaration = ts.Declaration>(
	symbol?: ts.Symbol
): TDeclaration | undefined {
	if (!symbol) {
		return undefined;
	}

	if (symbol.valueDeclaration) {
		return symbol.valueDeclaration as TDeclaration;
	}

	// There are multiple declarations eg. for interfaces which are redeclared in multiple places.
	// We'll just take the first one.
	return symbol.declarations?.[0] as TDeclaration | undefined;
}

export function getSourceFile(symbol: ts.Symbol): ts.SourceFile | undefined {
	return getDeclaration(symbol)?.getSourceFile();
}

export function getType(
	symbol: ts.Symbol,
	declaration: ts.Declaration | undefined,
	typeChecker: ts.TypeChecker
): ts.Type {
	return declaration
		? typeChecker.getTypeOfSymbolAtLocation(symbol, declaration)
		: typeChecker.getDeclaredTypeOfSymbol(symbol);
}
