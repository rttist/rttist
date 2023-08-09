import * as ts from "typescript";
import { Context } from "../contexts/context";
import { mainVisitor } from "./main-visitor";

export function functionVisitor(declaration: ts.FunctionLikeDeclarationBase, context: Context): void {
	context.visitWithNewContext(declaration, visitFunctionDeclaration);

	const typeReference = context.transformerContext.syntaxTypeChecker.getType(declaration);

	if (ts.isFunctionDeclaration(declaration)) {
		context.metadata.generateMetadataForType(
			typeReference,
			context.typeChecker.getTypeAtLocation(declaration),
			false,
			context.typeChecker.getSymbolAtLocation(declaration),
			undefined,
			context
		);

		return;
	}

	if (ts.isFunctionExpression(declaration)) {
		context.metadata.generateMetadataForType(
			typeReference,
			context.typeChecker.getTypeAtLocation(declaration),
			false,
			context.typeChecker.getSymbolAtLocation(declaration),
			undefined,
			context
		);

		return;
	}
}

function visitFunctionDeclaration(node: ts.Node, context: Context): void {
	mainVisitor(node, context);
}
