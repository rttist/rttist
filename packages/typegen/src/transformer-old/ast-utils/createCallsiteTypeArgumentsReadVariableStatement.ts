import {
	FncNames,
	RTTIST_NAMESPACE
}                               from "@rttist/core";
import * as ts                  from "typescript";
import { TYPE_PARAMS_VAR_NAME } from "../consts";

export function createCallsiteTypeArgumentsReadVariableStatement(
	typeParameters: string[],
	functionName: ts.Identifier,
	declaration: ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration
)
{
	const functionRef = ts.isMethodDeclaration(declaration)
		? ts.factory.createPropertyAccessExpression(
			ts.factory.createThis(),
			functionName
		)
		: functionName;

	return ts.factory.createVariableStatement(
		undefined,
		ts.factory.createVariableDeclarationList([
			ts.factory.createVariableDeclaration(
				ts.factory.createArrayBindingPattern(
					typeParameters.map(tp =>
						ts.factory.createBindingElement(undefined, undefined, TYPE_PARAMS_VAR_NAME + tp)
					)
				),
				undefined,
				undefined,
				ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier(RTTIST_NAMESPACE),
						FncNames.resolveFunctionCallsite
					),
					undefined,
					[
						functionRef
					]
				)
			)
		], ts.NodeFlags.Const)
	);
}