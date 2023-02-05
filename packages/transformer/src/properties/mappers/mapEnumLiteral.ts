import { TypeKind }         from "rttist";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeRef }       from "../../utils/getTypeRef";

export function mapEnumLiteral(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	symbol ??= type.symbol;
	
	return {
		kind: TypeKind.EnumLiteral,
		name: type.symbol.escapedName.toString(),
		enum: getTypeRef(context.typeChecker.getDeclaredTypeOfSymbol((symbol as any).parent), false, undefined, context.transformerContext)
		//types: type.types.map(type => context.metadata.referenceType(type, undefined, undefined, context)),
		// exported: declaration !== undefined && isExported(declaration)
	};
}