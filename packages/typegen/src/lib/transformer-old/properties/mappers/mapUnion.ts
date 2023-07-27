import * as ts from "typescript";
import { TypeKind } from "rttist";
import { Context } from "../../contexts/Context";
import { TypeMapperResult } from "../../../declarations/mappers";
import { UnionTypeProperties } from "../../../declarations/TypeProperties";

export function mapUnion(type: ts.UnionType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	return {
		kind: TypeKind.Union,
		types: type.types.map((type) => context.metadata.referenceType(type, false, undefined, undefined, context)),
	} as UnionTypeProperties;
}
