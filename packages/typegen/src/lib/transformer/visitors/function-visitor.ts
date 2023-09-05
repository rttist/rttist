import * as ts from "typescript";
import { Context } from "../contexts/context";
import { mainVisitor } from "./main-visitor";
import { SignatureDeclarationBase } from "typescript";

export function functionVisitor(declaration: ts.FunctionLikeDeclarationBase, context: Context): void {
	context.visitWithNewContext(declaration, visitFunctionDeclaration);

	const typeReference = context.transformerContext.syntaxTypeChecker.getType(declaration);

	if (ts.isFunctionDeclaration(declaration) || ts.isFunctionExpression(declaration)) {
		context.metadata.generateMetadataForType(
			typeReference,
			context.typeChecker.getTypeAtLocation(declaration),
			false,
			context.typeChecker.getSymbolAtLocation(declaration),
			undefined,
			context
		);
	}

	if ((declaration as ts.SignatureDeclarationBase).typeParameters) {
		context.metadata.generateMetadataForTypeParameters(
			(declaration as ts.SignatureDeclarationBase).typeParameters!,
			context
		);
	}
}

function visitFunctionDeclaration(node: ts.Node, context: Context): void {
	mainVisitor(node, context);
}
