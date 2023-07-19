import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { Context } from "../../contexts/context";

export function mapTemplateLiteral(
	type: ts.TemplateLiteralType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult {
	return undefined;
}
