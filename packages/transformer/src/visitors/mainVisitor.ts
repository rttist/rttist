import * as ts                    from "typescript";
import { Context }                from "../contexts/Context";
import { isInterestingStatement } from "../utils/isInterestingStatement";
import { classVisitor }           from "./classVisitor";
import { functionVisitor }        from "./functionVisitor";
import { interfaceVisitor }       from "./interfaceVisitor";
import { statementVisitor }       from "./statementVisitor";
import { typeAliasVisitor }       from "./typeAliasVisitor";

/**
 * Main visitor, splitting visitation into specific parts
 * @param nodeToVisit
 * @param context
 */
export function mainVisitor(nodeToVisit: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	switch (nodeToVisit.kind)
	{
		case  ts.SyntaxKind.ClassDeclaration:
			return classVisitor(nodeToVisit as unknown as ts.ClassDeclaration, context);
		case  ts.SyntaxKind.InterfaceDeclaration:
			return interfaceVisitor(nodeToVisit as unknown as ts.InterfaceDeclaration, context);
		case  ts.SyntaxKind.TypeAliasDeclaration:
			return typeAliasVisitor(nodeToVisit as unknown as ts.TypeAliasDeclaration, context);
		case  ts.SyntaxKind.FunctionDeclaration:
			return functionVisitor(nodeToVisit as unknown as ts.FunctionDeclaration, context);
		// Interesting Statements
		case  ts.SyntaxKind.ExpressionStatement:
		case  ts.SyntaxKind.WhileStatement:
		case  ts.SyntaxKind.DoStatement:
		case  ts.SyntaxKind.ForStatement:
		case  ts.SyntaxKind.ForInStatement:
		case  ts.SyntaxKind.ForOfStatement:
		case  ts.SyntaxKind.IfStatement:
		case  ts.SyntaxKind.SwitchStatement:
		case  ts.SyntaxKind.ThrowStatement:
		case  ts.SyntaxKind.TryStatement:
		case  ts.SyntaxKind.VariableStatement:
		case  ts.SyntaxKind.WithStatement:
		case  ts.SyntaxKind.Block:
			return statementVisitor(nodeToVisit as ts.Statement, context);
	}

	return ts.visitEachChild(nodeToVisit, context.visitor, context.transformationContext);
}
