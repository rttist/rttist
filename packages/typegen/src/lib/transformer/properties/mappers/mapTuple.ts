import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { Context } from "../../contexts/context";
import { getSymbol } from "../../utils/typeHelpers";

export function mapTuple(type: ts.TupleType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	symbol ??= getSymbol(type, context.typeChecker);

	if (!symbol) {
		return undefined;
	}

	if ((type.target as ts.TupleType).labeledElementDeclarations) {
		// TODO: labeled
	}

	return {
		kind: TypeKind.Tuple,
		name: symbol?.name,
		// TODO: Properties
		// properties: type.typeArguments?.map((propType, i) => ({ n: i.toString(), t: getTypeCall(propType, undefined, context, getCtorTypeReference(propType.symbol)) }))
	};
}
