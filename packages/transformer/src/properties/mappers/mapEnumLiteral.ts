import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeId }        from "../../utils/typeHelpers";

export function mapEnumLiteral(type: ts.UnionType, context: Context): TypeMapperResult
{
	return {
		id: getTypeId(type, context.typeChecker),
		kind: TypeKind.EnumLiteral,
		name: type.symbol.escapedName.toString(),
		types: type.types.map(type => context.metadata.referenceType(type, undefined, context))
	};
}