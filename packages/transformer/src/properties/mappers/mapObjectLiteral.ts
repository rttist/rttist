import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeId }        from "../../utils/typeHelpers";
import { getProperties }    from "../getProperties";

export function mapObjectLiteral(type: ts.ObjectType, context: Context): TypeMapperResult
{
	// const symbol = type.aliasSymbol || type.symbol;

	return {
		id: getTypeId(type, context.typeChecker),
		kind: TypeKind.Object,
		properties: getProperties(type, context)
	};
}