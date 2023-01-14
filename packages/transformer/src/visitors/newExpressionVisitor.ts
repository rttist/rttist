import * as ts from "typescript";
import { createConstructGenericClassExpression } from "../ast-utils/createConstructGenericClassExpression";
import { getArgumentsTypes } from "../ast-utils/getArgumentsTypes";
import { Context } from "../contexts/Context";

export function newExpressionVisitor(expression: ts.NewExpression, context: Context): ts.VisitResult<ts.Node>
{
	if (expression.typeArguments?.length! > 0)
	{
		// const type = context.typeChecker.getTypeAtLocation(expression);
		//
		// // Add generic type's type to the metadata.
		// const ref = context.metadata.referenceType(
		// 	type,
		// 	context.typeChecker.getSymbolAtLocation(expression.expression),
		// 	undefined,
		// 	context
		// );
		const typeArgTypes = getArgumentsTypes(expression, context);
		const visitedArguments: ts.NodeArray<ts.Expression> = expression.arguments === undefined
			? [] as any as ts.NodeArray<ts.Expression>
			: ts.visitNodes(
				expression.arguments,
				context.visitor
			);

		return createConstructGenericClassExpression(
			expression.expression,
			typeArgTypes,
			ts.factory.createArrayLiteralExpression(visitedArguments),
			undefined,
			context
		);
	}


	// const type = context.typeChecker.getTypeAtLocation(expression.expression);
	//
	// // Add interface's type to the metadata.
	// const ref = context.metadata.referenceType(
	// 	type,
	// 	context.typeChecker.getSymbolAtLocation(expression.expression),
	// 	undefined,
	// 	context
	// );

	return ts.visitEachChild(expression, context.visitor, context.transformationContext);
}

// function visitInterfaceDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
// {
// 	return node;
// }