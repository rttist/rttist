import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapIntersection(type: ts.IntersectionType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	// return {
	// 		kind: TypeKind.Intersection,
	// 		name: type.symbol?.escapedName.toString(),
	// 		types: type.types.map((type: ts.Type) => getTypeCall(type, undefined, context))
	// };

	return undefined;
}