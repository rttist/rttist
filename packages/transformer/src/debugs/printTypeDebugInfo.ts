import * as ts              from "typescript";
import { getSymbol }        from "../utils/typeHelpers";
import { printSymbolFlags } from "./printSymbolFlags";
import { printTypeFlags }   from "./printTypeFlags";

export function printTypeDebugInfo(type: ts.Type, typeChecker: ts.TypeChecker): string
{
	const symbol = getSymbol(type, typeChecker);
	const symbolInfo = symbol ? `name: '${symbol.escapedName}' ${printSymbolFlags(symbol)}` : "is undefined.";
	return `Type ${printTypeFlags(type)}; symbol ${symbolInfo}`;
}