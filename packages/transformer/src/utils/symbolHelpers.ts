import * as ts                 from "typescript";
import { printSymbolFlags }    from "../debugs/printSymbolFlags";
import { log }                 from "../log";
import { getNodeLocationText } from "./traceHelpers";

/**
 * Returns declaration of symbol. ValueDeclaration is preferred.
 * @param symbol
 */
export function getDeclaration<TDeclaration extends ts.Declaration = ts.Declaration>(symbol?: ts.Symbol): TDeclaration | undefined
{
	if (!symbol)
	{
		return undefined;
	}

	if (symbol.valueDeclaration)
	{
		return symbol.valueDeclaration as TDeclaration;
	}

	// TODO: Check valueDeclaration vs declaration. TypeAlias has no valueDeclaration, interface has or not? When are there multiple declarations?
	// TypeAliases has no valueDeclaration.
	
	const declaration = symbol.declarations?.[0] as TDeclaration | undefined;

	log.warn(
		"Symbol has no valueDeclaration.",
		symbol.escapedName,
		printSymbolFlags(symbol),
		declaration ? getNodeLocationText(declaration) : undefined
	);

	return declaration;
}

export function getSourceFile(symbol: ts.Symbol): ts.SourceFile | undefined
{
	return getDeclaration(symbol)?.getSourceFile();
}