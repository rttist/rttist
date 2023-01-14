import * as ts                                   from "typescript";
import { createConstructGenericClassExpression } from "../ast-utils/createConstructGenericClassExpression";
import { getArgumentsTypes }                     from "../ast-utils/getArgumentsTypes";
import { Context }                               from "../contexts/Context";
import { TypeArgumentsInfo }                     from "../declarations/callsites";
import {
	hasTypeArguments,
	isInvalidType
}                                                from "../utils/typeHelpers";

export function newExpressionVisitor(expression: ts.NewExpression, context: Context): ts.VisitResult<ts.Node>
{
	let typeArgTypes: undefined | TypeArgumentsInfo = undefined;

	// It has Type Arguments
	if (expression.typeArguments?.length! > 0)
	{
		typeArgTypes = getArgumentsTypes(expression, context);
	}
	// Myabe be something like const Ctor: typeof Foo<number> = Foo; return new Ctor();, so the type has the args
	else
	{
		const type = context.typeChecker.getTypeAtLocation(expression);

		if (!isInvalidType(type) && hasTypeArguments(type))
		{
			typeArgTypes = type.resolvedTypeArguments.map(ta => [ta, undefined]);
		}
	}
	
	if (typeArgTypes !== undefined)
	{
		const visitedArguments: ts.NodeArray<ts.Expression> = expression.arguments === undefined
			? [] as any as ts.NodeArray<ts.Expression>
			: ts.visitNodes(
				expression.arguments,
				context.visitor
			);

		return createConstructGenericClassExpression(
			ts.visitNode(expression.expression, context.visitor),
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