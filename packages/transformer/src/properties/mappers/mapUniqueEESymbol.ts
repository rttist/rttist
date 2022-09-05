import { TypeKind }         from "@rtti/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeId }        from "../../utils/typeHelpers";

export function mapUniqueEESymbol(type: ts.UniqueESSymbolType, context: Context): TypeMapperResult
{
	return {
		id: getTypeId(type),
		kind: TypeKind.UniqueSymbol,
		name: type.escapedName?.toString()
	};
}