import * as ts from "typescript";
import { IndexFlags } from "rttist";
import { IndexProperties } from "../../../declarations/type-properties";
import { Context } from "../contexts/context";

export function mapIndexes(type: ts.Type, context: Context): Array<IndexProperties> {
	return context.typeChecker.getIndexInfosOfType(type).map((indexInfo: ts.IndexInfo) => {
		return {
			key: context.metadata.generateMetadataForType(
				context.transformerContext.tsTypeTypeChecker.getType(indexInfo.keyType, undefined, false),
				indexInfo.keyType,
				false,
				undefined,
				undefined,
				context
			).typeReference,
			type: context.metadata.generateMetadataForType(
				context.transformerContext.tsTypeTypeChecker.getType(indexInfo.type, undefined, false),
				indexInfo.type,
				false,
				undefined,
				undefined,
				context
			).typeReference,
			flags: indexInfo.isReadonly ? IndexFlags.Readonly : IndexFlags.None,
		};
	});
}
