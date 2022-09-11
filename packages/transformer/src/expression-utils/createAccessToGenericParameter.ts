import * as ts                  from "typescript";
import { TYPE_PARAMS_VAR_NAME } from "../consts";
import { Context }              from "../contexts/Context";

/**
 * EMIT: __typeParam__ && __typeParam__.X
 * @param typeParameterName
 * @param context
 */
export function createAccessToGenericParameter(typeParameterName: ts.Identifier, context: Context)
{
	return ts.factory.createParenthesizedExpression(
		ts.factory.createBinaryExpression(
			ts.factory.createIdentifier(TYPE_PARAMS_VAR_NAME),
			ts.SyntaxKind.AmpersandAmpersandToken,
			ts.factory.createPropertyAccessExpression(
				ts.factory.createIdentifier(TYPE_PARAMS_VAR_NAME),
				ts.factory.createIdentifier(typeParameterName.escapedText.toString())
			)
		)
	);
}