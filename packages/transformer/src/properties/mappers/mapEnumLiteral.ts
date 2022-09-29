import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { isExported }       from "../../utils/isExported";
import { getDeclaration }   from "../../utils/symbolHelpers";
import {
	getSymbol,
	getTypeId
} from "../../utils/typeHelpers";

export function mapEnumLiteral(type: ts.UnionType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	symbol ??= getSymbol(type, context.typeChecker);
	// const declaration = getDeclaration()
	
	return {
		id: getTypeId(type, symbol, context.typeChecker),
		kind: TypeKind.EnumLiteral,
		name: type.symbol.escapedName.toString(),
		types: type.types.map(type => context.metadata.referenceType(type, undefined, undefined, context)),
		// exported: declaration !== undefined && isExported(declaration)
	};
}