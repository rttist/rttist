import * as ts                   from "typescript";
import { Context }               from "../contexts/Context";
import { callExpressionVisitor } from "./callExpressionVisitor";
import { classVisitor }          from "./classVisitor";
import { functionVisitor }       from "./functionVisitor";
import { interfaceVisitor }      from "./interfaceVisitor";
import { newExpressionVisitor }  from "./newExpressionVisitor";
import { typeAliasVisitor }      from "./typeAliasVisitor";

/**
 * Main visitor, splitting visitation into specific parts
 * @param nodeToVisit
 * @param context
 */
export function mainVisitor(nodeToVisit: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	switch (nodeToVisit.kind)
	{
		case  ts.SyntaxKind.ClassExpression: // TODO: Update classVisitor to support CLassExpression
		case  ts.SyntaxKind.ClassDeclaration:
			return classVisitor(nodeToVisit as unknown as ts.ClassDeclaration | ts.ClassExpression, context);
		case  ts.SyntaxKind.InterfaceDeclaration:
			return interfaceVisitor(nodeToVisit as unknown as ts.InterfaceDeclaration, context);
		case  ts.SyntaxKind.TypeAliasDeclaration:
			return typeAliasVisitor(nodeToVisit as unknown as ts.TypeAliasDeclaration, context);
		case  ts.SyntaxKind.MethodDeclaration: // This will be called only if declared in objects; class methods are handled inside classVisitor
		case  ts.SyntaxKind.FunctionExpression:
		case  ts.SyntaxKind.FunctionDeclaration:
			return functionVisitor(nodeToVisit as unknown as ts.FunctionDeclaration, context);
		case ts.SyntaxKind.CallExpression: // TODO: Handle Reflect.apply() etc.
			return callExpressionVisitor(nodeToVisit as ts.CallExpression, context);
		case ts.SyntaxKind.NewExpression:
			return newExpressionVisitor(nodeToVisit as ts.NewExpression, context);
	}

	return ts.visitEachChild(nodeToVisit, context.visitor, context.transformationContext);
}
