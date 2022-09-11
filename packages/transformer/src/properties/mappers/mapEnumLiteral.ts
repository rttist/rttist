import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeRef }       from "../../utils/typeHelpers";

export function mapEnumLiteral(type: ts.UnionType, context: Context): TypeMapperResult
{
	return {
		id: getTypeRef(type, context.typeChecker),
		kind: TypeKind.EnumLiteral,
		name: type.symbol.escapedName.toString(),
		types: type.types.map(type => context.metadata.addTypeAndOrGetId(type, undefined, context))
	};
}