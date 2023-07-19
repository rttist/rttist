import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { Context } from "../../contexts/context";

export function mapUnion(type: ts.UnionType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	return undefined;
	// return {
	// 	kind: TypeKind.Union,
	// 	types: type.types.map((type) => context.metadata.referenceType(type, false, undefined, undefined, context)),
	// } as UnionTypeProperties;
}
