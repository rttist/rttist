import * as ts from "typescript";

export function isDeclaration(node: ts.Node): node is ts.Declaration {
	return (
		ts.SyntaxKind[node.kind].endsWith("Declaration") ||
		ts.isClassExpression(node) ||
		ts.isFunctionExpression(node) ||
		ts.isArrowFunction(node)
	);
}
