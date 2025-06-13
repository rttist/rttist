import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { Context } from "../../contexts/context";
import { isExported } from "../../utils/isExported";
import { getDeclaration } from "../../utils/symbolHelpers";
import { getCallSignatures } from "../get-call-signatures";

export function mapFunction(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	const declaration = getDeclaration(symbol);

	return {
		kind: TypeKind.Function,
		name: type.symbol.escapedName.toString(),
		signatures: getCallSignatures(type, context),
		exported: declaration && isExported(declaration),
	};
}
