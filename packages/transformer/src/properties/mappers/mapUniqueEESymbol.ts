import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeId }        from "../../utils/typeHelpers";

export function mapUniqueEESymbol(type: ts.UniqueESSymbolType, context: Context): TypeMapperResult
{
	return {
		id: getTypeId(type, context.typeChecker),
		kind: TypeKind.UniqueSymbol,
		name: type.escapedName?.toString()
	};
}