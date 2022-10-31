import { TypeKind }          from "rttist";
import * as ts               from "typescript";
import { Context }           from "../../contexts/Context";
import { TypeMapperResult }  from "../../declarations/mappers";
import { getCallSignatures } from "../getCallSignatures";

export function mapFunction(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	return {
		kind: TypeKind.Function,
		name: type.symbol.escapedName.toString(),
		signatures: getCallSignatures(type, context)
	};
}