import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapUnion(type: ts.UnionType, context: Context): TypeMapperResult
{
	// return {
	// 		kind: TypeKind.Union,
	// 		name: type.symbol?.escapedName.toString(),
	// 		types: type.types.map((type: ts.Type) => getTypeCall(type, undefined, context))
	// };

	return undefined;
}