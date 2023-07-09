import {
	SymbolKind,
	TypeKind
}                              from "rttist";
import * as ts                 from "typescript";
import { Context }             from "../../contexts/Context";
import { TypeMapperResult }    from "../../declarations/mappers";
import { getUniqueSymbolInfo } from "../../utils/getUniqueSymbolInfo";

export function mapUniqueSymbol(
	type: ts.UniqueESSymbolType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult
{
	const symbolInfo = getUniqueSymbolInfo(type, context);

	if (symbolInfo.kind === SymbolKind.ES)
	{
		return {
			kind: TypeKind.ESSymbol,
			name: symbolInfo.key,
			key: symbolInfo.key
		};
	}

	return {
		kind: TypeKind.UniqueSymbol,
		name: symbolInfo.key,
		key: symbolInfo.key
	};
}