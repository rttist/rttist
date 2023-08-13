import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { UnionTypeProperties } from "../../../../declarations/type-properties";
import { Context } from "../../contexts/context";

export function mapUnion(type: ts.UnionType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	return {
		kind: TypeKind.Union,
		types: type.types.map(
			(type) => context.transformerContext.tsTypeTypeChecker.getType(type, undefined, false)
			// context.metadata.generateMetadataForType(
			// 	context.transformerContext.tsTypeTypeChecker.getType(type, undefined, false),
			// 	type,
			// 	false,
			// 	undefined,
			// 	undefined,
			// 	context
			// ).typeReference
		),
	} as UnionTypeProperties;
}
