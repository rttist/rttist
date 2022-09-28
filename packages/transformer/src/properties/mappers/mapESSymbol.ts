import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapESSymbol(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	return {
		kind: TypeKind.Symbol
	};
}