import type { Context } from "../contexts/context";
import * as ts from "typescript";
import { functionVisitor } from "./function-visitor";

export function classVisitor(
	declaration: ts.ClassDeclaration | ts.ClassExpression,
	context: Context
): ts.VisitResult<ts.Node> {
	const type = context.typeChecker.getTypeAtLocation(declaration);

	context.metadata.generateMetadataForType(
		context.transformerContext.syntaxTypeChecker.getType(declaration),
		type,
		false,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined, // context.typeChecker.typeToTypeNode(type, declaration, NodeBuilderFlags.None)
		context
	);

	context.visitWithNewContext(declaration, visitClassDeclaration);

	return declaration;
}

function visitClassDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node> {
	if (ts.isPropertyDeclaration(node)) {
		if (node.initializer) {
			if (ts.isClassExpression(node.initializer)) {
				context.visitWithNewContext(node.initializer, visitClassDeclaration);
				return node;
			}

			return ts.visitEachChild(node, context.visitor, context.transformationContext) as ts.PropertyDeclaration;
		}

		return node;
	}

	if (ts.isGetAccessorDeclaration(node)) {
	}

	if (ts.isSetAccessorDeclaration(node)) {
	}

	// Index signature has no implementation to alter.
	// if (ts.isIndexSignatureDeclaration(node))
	// {
	//
	// }

	if (ts.isMethodDeclaration(node)) {
		return functionVisitor(node, context);
	}

	if (ts.isConstructorDeclaration(node)) {
		return functionVisitor(node, context);
	}

	return node;
}
