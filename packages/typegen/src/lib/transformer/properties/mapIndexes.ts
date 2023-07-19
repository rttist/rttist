import * as ts from "typescript";
import { IndexFlags } from "rttist";
import { IndexProperties } from "../../../declarations/type-properties";
import { Context } from "../contexts/context";

export function mapIndexes(type: ts.Type, context: Context): Array<IndexProperties> {
	return [];

	// return context.typeChecker.getIndexInfosOfType(type)
	// 	.map((indexInfo: ts.IndexInfo) => {
	// 		return {
	// 			key: context.metadata.referenceType(indexInfo.keyType, false, undefined, undefined, context),
	// 			type: context.metadata.referenceType(indexInfo.type, false, undefined, undefined, context),
	// 			flags: (
	// 				indexInfo.isReadonly
	// 					? IndexFlags.Readonly
	// 					: IndexFlags.None
	// 			)
	// 		};
	// 	});
}
