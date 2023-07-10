import * as ts from "typescript";
import { SymbolKind } from "rttist";
import { ESSymbols } from "../consts";
import { Context } from "../contexts/context";
import { getDeclaration } from "./symbolHelpers";
import { getSymbol, getUniqueSymbolName, isVariableLikeDeclarationWithInitializer } from "./typeHelpers";

export function getUniqueSymbolInfo(type: ts.Type, context: Context): { kind: SymbolKind; key: string } {
	let name: string | undefined = getUniqueSymbolName(type);

	if (ESSymbols.has(name!)) {
		return {
			kind: SymbolKind.ES,
			key: name!,
		};
	}

	const symbol = getSymbol(type, context.typeChecker);
	const declaration = symbol && getDeclaration(symbol);

	if (declaration !== undefined) {
		if (
			isVariableLikeDeclarationWithInitializer(declaration) &&
			declaration.initializer !== undefined &&
			ts.isCallExpression(declaration.initializer) &&
			ts.isPropertyAccessExpression(declaration.initializer.expression) &&
			ts.isIdentifier(declaration.initializer.expression.name) &&
			declaration.initializer.expression.name.escapedText === "for"
		) {
			const arg = declaration.initializer.arguments[0];
			const argumentType = context.typeChecker.getTypeAtLocation(arg);

			return {
				kind: SymbolKind.Unique,
				key:
					(argumentType
						? argumentType.isStringLiteral() && argumentType.value
						: ts.isStringLiteral(arg) && arg.text) || "",
			};
		}
	}

	return {
		kind: SymbolKind.Unique,
		key: name || "",
	};
}
