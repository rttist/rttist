import { TypeKind }         from "@rttist/abstract";
import * as ts              from "typescript";
import { ESSymbols }        from "../../consts";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getDeclaration }   from "../../utils/symbolHelpers";
import {
	getSymbol,
	getUniqueSymbolName,
	isVariableLikeDeclarationWithInitializer
}                           from "../../utils/typeHelpers";

export function mapUniqueSymbol(
	type: ts.UniqueESSymbolType,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeMapperResult
{
	let name: string | undefined = getUniqueSymbolName(type);

	if (ESSymbols.has(name!))
	{
		return {
			kind: TypeKind.ESSymbol,
			name: name!,
			key: name!
		};
	}

	symbol = getSymbol(type, context.typeChecker);
	const declaration = symbol && getDeclaration(symbol);

	if (declaration !== undefined)
	{
		if (
			isVariableLikeDeclarationWithInitializer(declaration)
			&& declaration.initializer !== undefined
			&& ts.isCallExpression(declaration.initializer)
			&& ts.isPropertyAccessExpression(declaration.initializer.expression)
			&& ts.isIdentifier(declaration.initializer.expression.name)
			&& declaration.initializer.expression.name.escapedText === "for"
		)
		{
			const arg = declaration.initializer.arguments[0];
			const argumentType = context.typeChecker.getTypeAtLocation(arg);
			const key = argumentType
				? argumentType.isStringLiteral() && argumentType.value
				: ts.isStringLiteral(arg) && arg.text;

			return {
				kind: TypeKind.UniqueSymbol,
				name: name!,
				key: key || undefined
			};
		}
	}

	return {
		kind: TypeKind.UniqueSymbol,
		name: name
	};
}