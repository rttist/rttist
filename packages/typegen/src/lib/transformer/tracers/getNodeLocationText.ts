import * as ts from "typescript";

export function getNodeLocationText(atNode: ts.Node)
{
	if (ts.isSourceFile(atNode))
	{
		return atNode.fileName;
	}

	const sourceFile = atNode.getSourceFile();
	const end = atNode.end - 50 > atNode.pos ? atNode.pos + 50 : atNode.end;
	const statementText = sourceFile.text.slice(atNode.pos, end);
	const filePos = sourceFile.getLineAndCharacterOfPosition(atNode.pos);

	return `${statementText.trim()} (${sourceFile.fileName}:${filePos.line}:${filePos.character})`;
}