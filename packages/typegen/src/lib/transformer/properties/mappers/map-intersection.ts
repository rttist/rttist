import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { IntersectionTypeProperties } from "../../../../declarations/type-properties";
import { Context } from "../../contexts/context";

export function mapIntersection(
	type: ts.IntersectionType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult {
	return {
		kind: TypeKind.Intersection,
		types: type.types.map(
			(type) =>
				context.metadata.generateMetadataForType(
					context.transformerContext.tsTypeTypeChecker.getType(type, undefined, false),
					type,
					false,
					undefined,
					undefined,
					context
				).typeReference
		),
	} as IntersectionTypeProperties;
}
