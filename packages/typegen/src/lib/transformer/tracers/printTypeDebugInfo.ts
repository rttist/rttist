import * as ts              from "typescript";
import { getSymbol }        from "../utils/typeHelpers";
import { printSymbolFlags } from "./printSymbolFlags";
import { printTypeFlags }   from "./printTypeFlags";

export function printTypeDebugInfo(type: ts.Type, typeChecker: ts.TypeChecker): string
{
	const symbol = getSymbol(type, typeChecker);
	
	if (symbol) {
		return `Type (${printTypeFlags(type)}); Symbol (name: '${symbol.escapedName}', ${printSymbolFlags(symbol)})`;
	}
	
	const properties = type.getProperties();
	
	return `Type ${printTypeFlags(type)}; symbol is undefined.
	{
		${properties.slice(0, 4).map(prop => prop.escapedName).join("\n\t\t")}${properties.length > 4 ? "\n\t\t..." : ""}
	}
	`;
}