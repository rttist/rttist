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
	const callsiteReferences = directTypeCallsiteReferenceFactory(typeArgTypes, context);

	const constructGenericArgs = [
		// Class
		classObject,
		// List of type parameter references
		ts.factory.createArrayLiteralExpression(
			createReferenceExpressions(callsiteReferences, undefined, context),
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