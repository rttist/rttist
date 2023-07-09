import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapIndexedAccessType(type: ts.IndexedAccessType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	// return {
	// 		kind: TypeKind.IndexedAccess,
	// 		indexedAccess: {
	// 			objectType: getTypeCall(type.objectType, type.objectType.symbol, context),
	// 			indexType: getTypeCall(type.indexType, type.indexType.symbol, context)
	// 		}
	// };

	return undefined;
}