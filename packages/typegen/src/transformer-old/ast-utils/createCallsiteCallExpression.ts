import {
	FncNames,
	RTTIST_NAMESPACE
}                                     from "@rttist/core";
import * as ts                        from "typescript";
import { Context }                    from "../contexts/Context";
import { CallsiteReference }          from "../declarations/callsites";
import { createReferenceExpressions } from "./createReferenceExpressions";

export function createCallsiteCallExpression(
	node: ts.CallExpression | ts.NewExpression,
	callsiteReferences: CallsiteReference,
	context: Context
)
{
	return ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(
			ts.factory.createIdentifier(RTTIST_NAMESPACE),
			ts.factory.createIdentifier(FncNames.createCallsite)
		),
		undefined,
		[
			node.expression,
			ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression)
				? node.expression.expression
				: ts.factory.createVoidZero(),
			ts.factory.createArrayLiteralExpression(
				createReferenceExpressions(callsiteReferences, undefined, context)
			),
			...(node.arguments || [])
		]
	);
}