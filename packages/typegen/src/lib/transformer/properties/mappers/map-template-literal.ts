import * as ts from "typescript";
import { Context } from "../../contexts/Context";
import { TypeMapperResult } from "../../../declarations/mappers";

export function mapTemplateLiteral(
	type: ts.TemplateLiteralType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult {
	return undefined;
}
