import { TypeKind } from "@rttist/abstract";
import * as ts from "typescript";
import { Context } from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import {
	getSymbol,
	getTypeId
} from "../../utils/typeHelpers";
import { mapProperties } from "../mapProperties";

export function mapObjectLiteral(type: ts.ObjectType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	symbol ??= getSymbol(type, context.typeChecker);

	return {
		id: getTypeId(type, symbol, context.typeChecker),
		kind: TypeKind.Object,
		properties: mapProperties(
			type.getProperties(),
			context
		),
		name: symbol?.escapedName.toString() || ""
	};
}