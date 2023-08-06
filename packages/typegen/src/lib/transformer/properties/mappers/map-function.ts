import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { Context } from "../../contexts/context";
import { getCallSignatures } from "../get-call-signatures";

export function mapFunction(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	return {
		kind: TypeKind.Function,
		name: type.symbol.escapedName.toString(),
		signatures: getCallSignatures(type, context),
	};
}
