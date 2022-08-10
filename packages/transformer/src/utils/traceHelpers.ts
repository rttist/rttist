import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import { getDeclaration } from "./symbolHelpers";
import { getSymbol }      from "./typeHelpers";

export function getNodeLocationText(atNode: ts.Node)
{
	const sourceFile = atNode.getSourceFile();
	const statementText = sourceFile.text.slice(atNode.pos, atNode.end);
	const filePos = sourceFile.getLineAndCharacterOfPosition(atNode.pos);

	return `${statementText.trim()} (${sourceFile.fileName}:${filePos.line}:${filePos.character})`;
}

export function getTypeSourceLocationText(type: ts.Type, context: Context)
{
	const symbol = getSymbol(type, context);
	const declaration = getDeclaration(symbol);
	const sourceFile = declaration.getSourceFile();
	const statementText = sourceFile.text.slice(declaration.pos, declaration.end);
	const filePos = sourceFile.getLineAndCharacterOfPosition(declaration.pos);

	return `${statementText.trim()} (${sourceFile.fileName}:${filePos.line}:${filePos.character})`;
}