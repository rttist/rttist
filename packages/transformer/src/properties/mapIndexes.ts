import * as ts             from "typescript";
import { IndexFlags }      from "rttist";
import { Context }         from "../contexts/Context";
import { IndexProperties } from "../declarations/TypeProperties";

export function mapIndexes(type: ts.Type, context: Context): Array<IndexProperties>
{
	return context.typeChecker.getIndexInfosOfType(type)
		.map((indexInfo: ts.IndexInfo) => {
			return {
				key: context.metadata.referenceType(indexInfo.keyType, undefined, undefined, context),
				type: context.metadata.referenceType(indexInfo.type, undefined, undefined, context),
				flags: (
					indexInfo.isReadonly
						? IndexFlags.Readonly
						: IndexFlags.None
				)
			};
		});
}