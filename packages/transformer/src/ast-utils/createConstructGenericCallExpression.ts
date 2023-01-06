import type { Context }                       from "../contexts/Context";
import {
	FncNames,
	RTTIST_NAMESPACE
}                                             from "@rttist/core";
import * as ts                                from "typescript";
import { directTypeCallsiteReferenceFactory } from "../utils/directTypeCallsiteReferenceFactory";
import { createReferenceExpressions }         from "./createReferenceExpressions";
import { getArgumentsTypes }                  from "./getArgumentsTypes";

export function createConstructGenericCallExpression(expression: ts.NewExpression, context: Context)
{
	const visitedArguments = expression.arguments === undefined
		? []
		: ts.visitNodes(
			expression.arguments,
			context.visitor
		);

	const typeArgTypes = getArgumentsTypes(expression, context);
	const callsiteReferences = directTypeCallsiteReferenceFactory(typeArgTypes, context);

	// if (typeArgTypes.length !== 0)
	// {
	// 	return createCallsiteCallExpression(
	// 		expression,
	// 		directTypeCallsiteReferenceFactory(typeArgTypes, context)
	// 	);
	// }

	return ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(
			ts.factory.createIdentifier(RTTIST_NAMESPACE),
			FncNames.constructGeneric
		),
		undefined,
		[
			// Class
			expression.expression,
			// List of type parameter references
			ts.factory.createArrayLiteralExpression(createReferenceExpressions(callsiteReferences), false),
			// arguments
			ts.factory.createArrayLiteralExpression([
				...visitedArguments
			])
		]
	);
}