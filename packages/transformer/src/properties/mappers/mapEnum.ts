import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapEnum(type: ts.EnumType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	return undefined;
}