import type { Context }                       from "../contexts/Context";
import type { TypeArgumentsInfo }             from "../declarations/callsites";
import {
	FncNames,
	RTTIST_NAMESPACE
}                                             from "@rttist/core";
import * as ts                                from "typescript";
import { directTypeCallsiteReferenceFactory } from "../utils/directTypeCallsiteReferenceFactory";
import { createReferenceExpressions }         from "./createReferenceExpressions";

export function createConstructGenericClassExpression(
	classObject: ts.LeftHandSideExpression,
	typeArgTypes: TypeArgumentsInfo,
	args: ts.Expression,
	newTarget: ts.LeftHandSideExpression | undefined,
	context: Context
)
{
	// // If there are no arguments, we cannot pass any generic type info 
	// // so we will skip generation of callsite to same performance.
	// if ((expression.arguments === undefined || expression.arguments.length === 0) 
	// 	&& (expression.typeArguments === undefined || expression.typeArguments.length === 0))
	// {
	// 	return ts.visitEachChild(expression, context.visitor, context.transformationContext);
	// }

	// if (typeArgTypes.length === 0 || typeArgTypes.every(ta => ta === null))
	// {
	// 	return ts.visitEachChild(expression, context.visitor, context.transformationContext);
	// }

	const callsiteReferences = directTypeCallsiteReferenceFactory(typeArgTypes, context);

	// if (typeArgTypes.length !== 0)
	// {
	// 	return createCallsiteCallExpression(
	// 		expression,
	// 		directTypeCallsiteReferenceFactory(typeArgTypes, context)
	// 	);
	// }

	const constructGenericArgs = [
		// Class
		classObject,
		// List of type parameter references
		ts.factory.createArrayLiteralExpression(
			createReferenceExpressions(callsiteReferences),
			false
		),
		// arguments
		args
	];

	if (newTarget !== undefined)
	{
		constructGenericArgs.push(newTarget);
	}

	return ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(
			ts.factory.createIdentifier(RTTIST_NAMESPACE),
			FncNames.constructGeneric
		),
		undefined,
		constructGenericArgs
	);
}