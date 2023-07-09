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
	// Myabe it's something like const Ctor: typeof Foo<number> = Foo; return new Ctor();, so the type has the args
	else
	{
		const type = context.typeChecker.getTypeAtLocation(expression);

		if (!isInvalidType(type) && hasTypeArguments(type) && type.resolvedTypeArguments.length !== 0)
		{
			typeArgTypes = type.resolvedTypeArguments.map(ta => [ta, undefined]);
		}
	}
	
	if (typeArgTypes !== undefined && expression.expression !== undefined)
	{
		const visitedArguments: ts.NodeArray<ts.Node> | undefined = expression.arguments === undefined
			? undefined
			: ts.visitNodes(
				expression.arguments,
				context.visitor
			);

		const visitedExpression = ts.visitNode(expression.expression, context.visitor) as ts.LeftHandSideExpression;

		if (visitedExpression !== undefined) {
			return createConstructGenericClassExpression(
				visitedExpression,
				typeArgTypes,
				ts.factory.createArrayLiteralExpression((visitedArguments ?? []) as ts.Expression[]),
				undefined,
				context
			);
		}
	}

	return ts.visitEachChild(expression, context.visitor, context.transformationContext);
}