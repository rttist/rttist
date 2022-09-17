import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getTypeId }        from "../../utils/typeHelpers";

export function mapTuple(type: ts.TupleType, context: Context): TypeMapperResult
{
	const symbol = type.aliasSymbol || type.symbol;

	if (!symbol)
	{
		return undefined;
	}

	if ((type.target as ts.TupleType).labeledElementDeclarations)
	{
		// TODO: labeled
	}

	return {
		id: getTypeId(type, context),
		kind: TypeKind.Tuple,
		name: symbol?.name,
		// fullName: getTypeFullName(type, context),
		// TODO: Properties
		// properties: type.typeArguments?.map((propType, i) => ({ n: i.toString(), t: getTypeCall(propType, undefined, context, getCtorTypeReference(propType.symbol)) }))
	};
}