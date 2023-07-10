import * as ts from "typescript";

const INTERESTING_STATEMENT_KINDS = new Set<ts.SyntaxKind>([
	ts.SyntaxKind.ExpressionStatement,
	ts.SyntaxKind.WhileStatement,
	ts.SyntaxKind.DoStatement,
	ts.SyntaxKind.ForStatement,
	ts.SyntaxKind.ForInStatement,
	ts.SyntaxKind.ForOfStatement,
	ts.SyntaxKind.IfStatement,
	ts.SyntaxKind.SwitchStatement,
	ts.SyntaxKind.ThrowStatement,
	ts.SyntaxKind.TryStatement,
	ts.SyntaxKind.VariableStatement,
	ts.SyntaxKind.WithStatement,
	ts.SyntaxKind.Block
]);

export function isInterestingStatement(node: ts.Node): node is ts.Statement
{
	return INTERESTING_STATEMENT_KINDS.has(node.kind);
}