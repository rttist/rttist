import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapEnumLiteral(type: ts.UnionType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	return {
		kind: TypeKind.EnumLiteral,
		name: type.symbol.escapedName.toString(),
		types: type.types.map(type => context.metadata.referenceType(type, undefined, undefined, context)),
		// exported: declaration !== undefined && isExported(declaration)
	};
}