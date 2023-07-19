import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { Context } from "../../contexts/context";

export function mapStringMapping(
	type: ts.StringMappingType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult {
	return undefined;
}
