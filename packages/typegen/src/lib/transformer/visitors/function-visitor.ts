import * as ts from "typescript";
import { Context } from "../contexts/context";
import { mainVisitor } from "./main-visitor";

export function functionVisitor(
	declaration: ts.FunctionLikeDeclarationBase,
	context: Context
): ts.VisitResult<ts.Node> {
	context.visitWithNewContext(declaration, visitFunctionDeclaration);

	if (ts.isFunctionDeclaration(declaration)) {
		context.metadata.addType(
			declaration,
			context.typeChecker.getTypeAtLocation(declaration),
			false,
			context.typeChecker.getSymbolAtLocation(declaration),
			undefined,
			context
		);

		return declaration;
	}

	if (ts.isFunctionExpression(declaration)) {
		context.metadata.addType(
			declaration,
			context.typeChecker.getTypeAtLocation(declaration),
			false,
			context.typeChecker.getSymbolAtLocation(declaration),
			undefined,
			context
		);

		return declaration;
	}

	return declaration;
}

function visitFunctionDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node> {
	return mainVisitor(node, context);
}
