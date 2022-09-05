import { TypeKind }         from "@rtti/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeId }        from "../../utils/typeHelpers";

export function mapEnumLiteral(type: ts.UnionType, context: Context): TypeMapperResult
{
	return {
		id: getTypeId(type),
		kind: TypeKind.EnumLiteral,
		name: type.symbol.escapedName.toString(),
		types: type.types.map(type => context.metadata.addType(type, undefined, context))
	};
}