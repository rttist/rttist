import * as ts from "typescript";
import type { Context } from "../contexts/context";
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
	if (context.transformerContext.config.devMode) {
		TypegenDebugger.visitingNode = nodeToVisit;
	}

	switch (nodeToVisit.kind) {
		case ts.SyntaxKind.ClassExpression:
		case ts.SyntaxKind.ClassDeclaration:
			classVisitor(nodeToVisit as unknown as ts.ClassDeclaration | ts.ClassExpression, context);
			return;
		case ts.SyntaxKind.InterfaceDeclaration:
			interfaceVisitor(nodeToVisit as unknown as ts.InterfaceDeclaration, context);
			return;
		case ts.SyntaxKind.TypeAliasDeclaration:
			typeAliasVisitor(nodeToVisit as unknown as ts.TypeAliasDeclaration, context);
			return;
		case ts.SyntaxKind.MethodDeclaration: // This will be called only if declared in objects; class methods are handled inside classVisitor
		case ts.SyntaxKind.FunctionExpression:
		case ts.SyntaxKind.FunctionDeclaration:
			functionVisitor(nodeToVisit as unknown as ts.FunctionDeclaration, context);
			return;
	}

	context.visitEachChild(nodeToVisit);
}
