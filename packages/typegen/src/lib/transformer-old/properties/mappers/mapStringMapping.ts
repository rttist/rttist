import * as ts from "typescript";
import { Context } from "../../contexts/Context";
import { TypeMapperResult } from "../../../declarations/mappers";

export function mapStringMapping(
	type: ts.StringMappingType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult {
	return undefined;
}
