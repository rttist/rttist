import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapIndexedAccessType(type: ts.IndexedAccessType, context: Context): TypeMapperResult
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