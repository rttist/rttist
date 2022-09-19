import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import { getDeclaration } from "./symbolHelpers";
import { getSymbol }      from "./typeHelpers";

export function getNodeStartLocationText(atNode: ts.Node)
{
	const sourceFile = atNode.getSourceFile();
	const filePos = sourceFile.getLineAndCharacterOfPosition(atNode.pos);
	return `${sourceFile.fileName}:${filePos.line}:${filePos.character}`;
}

export function getNodeLocationText(atNode: ts.Node)
{
	const sourceFile = atNode.getSourceFile();
	const end = atNode.end - 50 > atNode.pos ? atNode.pos + 50 : atNode.end;
	const statementText = sourceFile.text.slice(atNode.pos, end);
	const filePos = sourceFile.getLineAndCharacterOfPosition(atNode.pos);

	return `${statementText.trim()} (${sourceFile.fileName}:${filePos.line}:${filePos.character})`;
}

export function getTypeSourceLocationText(type: ts.Type, context: Context): string
{
	const symbol = getSymbol(type, context.typeChecker);

	if (symbol === undefined)
	{
		context.log.error("Cannot find Symbol of Type. Source location info cannot be created.\n\tType:", (type as any)["intrinsicName"] ?? type);
		return "Unknown type location.";
	}

	const declaration = getDeclaration(symbol);

	if (declaration === undefined)
	{
		context.log.error("Cannot find Declaration of Symbol. Source location info cannot be created.\n\tSymbol:", symbol.escapedName ?? symbol);
		return "Unknown type location.";
	}
	
	return getNodeLocationText(declaration);

	// const sourceFile = declaration.getSourceFile();
	// const statementText = sourceFile.text.slice(declaration.pos, declaration.end);
	// const filePos = sourceFile.getLineAndCharacterOfPosition(declaration.pos);
	//
	// return `${statementText.trim()} (${sourceFile.fileName}:${filePos.line}:${filePos.character})`;
}