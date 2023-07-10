import * as ts                        from "typescript";
import { TypeKind }                   from "rttist";
import { Context }                    from "../../contexts/Context";
import { TypeMapperResult }           from "../../declarations/mappers";
import { IntersectionTypeProperties } from "../../declarations/TypeProperties";

export function mapIntersection(
	type: ts.IntersectionType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult
{
	return {
		kind: TypeKind.Intersection,
		types: type.types.map(type => context.metadata.referenceType(
			type,
			false,
			undefined,
			undefined,
			context
		))
	} as IntersectionTypeProperties;
}