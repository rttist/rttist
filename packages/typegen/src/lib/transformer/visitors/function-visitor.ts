import * as ts from "typescript";
import { Context } from "../contexts/context";
import { getSymbol } from "../utils/typeHelpers";
import { mainVisitor } from "./main-visitor";

export function functionVisitor(declaration: ts.FunctionLikeDeclarationBase, context: Context): void {
	context.visitWithNewContext(declaration, visitFunctionDeclaration);

	const typeReference = context.transformerContext.syntaxTypeChecker.getType(declaration);
	const type = context.typeChecker.getTypeAtLocation(declaration);

	if (ts.isFunctionDeclaration(declaration) || ts.isFunctionExpression(declaration)) {
		context.metadata.generateMetadataForType(
			typeReference,
			type,
			false,
			context.typeChecker.getSymbolAtLocation(declaration) ?? getSymbol(type, context.typeChecker),
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
