import * as ts from "typescript";

export function updateSourceFile(visitedNode: ts.SourceFile, statementsToAdd: ts.Statement[]): ts.SourceFile
{
	const importsCount = visitedNode.statements.findIndex(s => !ts.isImportDeclaration(s));

	const finalizedStatements = importsCount === -1
		? [...statementsToAdd, ...visitedNode.statements]
		: visitedNode.statements.slice(0, importsCount).concat(statementsToAdd)
			.concat(visitedNode.statements.slice(importsCount));

	return ts.factory.updateSourceFile(visitedNode, finalizedStatements);
}