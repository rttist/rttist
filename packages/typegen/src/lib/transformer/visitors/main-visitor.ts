import * as ts from "typescript";
import { Context } from "../contexts/context";
import { classVisitor } from "./class-visitor";
import { functionVisitor } from "./function-visitor";
import { interfaceVisitor } from "./interface-visitor";
import { typeAliasVisitor } from "./type-alias-visitor";

/**
 * Main visitor, splitting visitation into specific parts
 * @param nodeToVisit
 * @param context
 */
export function mainVisitor(nodeToVisit: ts.Node, context: Context): void {
	switch (nodeToVisit.kind) {
		case ts.SyntaxKind.ClassExpression:
		case ts.SyntaxKind.ClassDeclaration:
			return classVisitor(nodeToVisit as unknown as ts.ClassDeclaration | ts.ClassExpression, context);
		case ts.SyntaxKind.InterfaceDeclaration:
			return interfaceVisitor(nodeToVisit as unknown as ts.InterfaceDeclaration, context);
		case ts.SyntaxKind.TypeAliasDeclaration:
			return typeAliasVisitor(nodeToVisit as unknown as ts.TypeAliasDeclaration, context);
		case ts.SyntaxKind.MethodDeclaration: // This will be called only if declared in objects; class methods are handled inside classVisitor
		case ts.SyntaxKind.FunctionExpression:
		case ts.SyntaxKind.FunctionDeclaration:
			return functionVisitor(nodeToVisit as unknown as ts.FunctionDeclaration, context);
	}

	context.visitEachChild(nodeToVisit);
}
