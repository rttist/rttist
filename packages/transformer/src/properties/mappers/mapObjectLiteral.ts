import * as ts              from "typescript";
import { TypeKind }         from "@rttist/abstract";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getSymbol }        from "../../utils/typeHelpers";
import { mapProperties }    from "../mapProperties";

export function mapObjectLiteral(type: ts.ObjectType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	symbol ??= getSymbol(type, context.typeChecker);

	return {
		kind: TypeKind.Object,
		properties: mapProperties(
			type.getProperties(),
			context
		),
		name: symbol?.escapedName.toString() || ""
	};
}