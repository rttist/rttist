import * as ts                 from "typescript";
import { Context }             from "../contexts/Context";
import { getDeclaration }      from "../utils/symbolHelpers";
import { getSymbol }           from "../utils/typeHelpers";
import { getNodeLocationText } from "./getNodeLocationText";

export function getTypeSourceLocationText(type: ts.Type, context: Context): string
{
	const symbol = getSymbol(type, context.typeChecker);

	if (symbol === undefined)
	{
		context.log.error(
			"Cannot find Symbol of Type. Source location info cannot be created.\n\tType:",
			(type as any)["intrinsicName"] ?? type
		);
		return "Unknown type location.";
	}

	const declaration = getDeclaration(symbol);

	if (declaration === undefined)
	{
		context.log.error(
			"Cannot find Declaration of Symbol. Source location info cannot be created.\n\tSymbol:",
			symbol.escapedName ?? symbol
		);
		return "Unknown type location.";
	}

	return getNodeLocationText(declaration);
}