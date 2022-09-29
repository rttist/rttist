import { TypeKind } from "@rttist/abstract";
import * as ts from "typescript";
import { Context } from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeId } from "../../utils/typeHelpers";
import { mapProperties } from "../mapProperties";

export function mapObjectLiteral(type: ts.ObjectType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	// const symbol = type.aliasSymbol || type.symbol;

	return {
		id: getTypeId(type, symbol, context.typeChecker),
		kind: TypeKind.Object,
		properties: mapProperties(
			type.getProperties().filter(prop => (prop.flags & ts.SymbolFlags.Prototype) === 0),
			context
		)
	};
}