import {
	FncNames,
	RTTIST_NAMESPACE
}                                    from "@rttist/core";
import * as ts                       from "typescript";
import {
	SELF_VAR_NAME,
	TYPE_PARAMS_VAR_NAME
}                                    from "../consts";
import { Context }                   from "../contexts/Context";
import { ClassContextTypeReference } from "../declarations/ClassContextTypeReference";
import { ClassTypeReference }        from "../declarations/ClassTypeReference";
import { ContextTypeReference }      from "../declarations/ContextTypeReference";
import { TransformerTypeReference }  from "../declarations/TransformerTypeReference";
import { toExpression }              from "../utils/toExpression";

export function createReferenceExpressions(
	callsiteReferences: Array<TransformerTypeReference | ContextTypeReference | ClassTypeReference | null>,
	thisContext: ts.Identifier | undefined,
	context: Context
)
{
	return callsiteReferences.map(reference => {
		if (reference instanceof ContextTypeReference)
		{
			return ts.factory.createIdentifier(TYPE_PARAMS_VAR_NAME + reference.typeName);
		}

		if (reference instanceof ClassTypeReference)
		{
			return ts.factory.createCallExpression(
				ts.factory.createPropertyAccessExpression(
					ts.factory.createIdentifier(RTTIST_NAMESPACE),
					FncNames.getClassTypeParameter
				),
				undefined,
				[
					thisContext ?? ts.factory.createThis(),
					ts.factory.createStringLiteral(reference.typeName)
				]
			);
		}

		if (reference instanceof ClassContextTypeReference)
		{
			return ts.factory.createCallExpression(
				ts.factory.createPropertyAccessExpression(
					ts.factory.createIdentifier(RTTIST_NAMESPACE),
					FncNames.getClassTypeParameter
				),
				undefined,
				[
					thisContext ?? ts.factory.createIdentifier(SELF_VAR_NAME + reference.className),
					ts.factory.createStringLiteral(reference.typeName)
				]
			);
		}

		return toExpression(reference, context.config);
	});
}