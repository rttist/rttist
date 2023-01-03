import {
	FncNames,
	PROTOTYPE_TYPE_PROPERTY,
	RTTIST_NAMESPACE
}                                             from "@rttist/core";
import * as ts                                from "typescript";
import { TYPE_PARAMS_VAR_NAME }               from "../consts";
import { Context }                            from "../contexts/Context";
import { directTypeCallsiteReferenceFactory } from "../utils/directTypeCallsiteReferenceFactory";
import { toExpression }                       from "../utils/toExpression";
import { callExpressionVisitor }              from "./callExpressionVisitor";

export function functionVisitor(declaration: ts.FunctionDeclaration, context: Context): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(declaration);
	const typeParameters = declaration.typeParameters?.map(tp => tp.name.escapedText) ?? [];

	const typeReference = context.metadata.referenceType(
		type,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined,
		context
	);

	declaration = context.createNestedContext(
		visitFunctionDeclaration,
		(typeArgTypes, context) => {

			return directTypeCallsiteReferenceFactory(typeArgTypes, context);
		},
		nestedContext => ts.visitEachChild(
			declaration,
			nestedContext.visitor,
			context.transformationContext
		)
	);

	declaration = ts.factory.updateFunctionDeclaration(
		declaration,
		declaration.modifiers,
		declaration.asteriskToken,
		declaration.name,
		declaration.typeParameters,
		declaration.parameters,
		declaration.type,
		ts.factory.createBlock(
			[
				// Declare variables for access to TypeParameters from Callsite
				ts.factory.createVariableStatement(
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
									declaration.name!, // TODO: May be undefined
								]
							)
						)
					], ts.NodeFlags.Const)
				),
				declaration.body ?? ts.factory.createEmptyStatement()
			]
		)
	);

	return [
		declaration,

		// EMIT: ClassIdentifier.prototype[REFLECTED_TYPE_ID] = typeId;
		ts.factory.createExpressionStatement(
			ts.factory.createBinaryExpression(
				ts.factory.createElementAccessExpression(
					ts.factory.createPropertyAccessExpression(
						declaration.name as ts.Expression,
						"prototype"
					),
					ts.factory.createStringLiteral(PROTOTYPE_TYPE_PROPERTY)
				),
				ts.factory.createToken(ts.SyntaxKind.EqualsToken),
				toExpression(typeReference)
			)
		)
	];
}

function visitFunctionDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	if (ts.isCallExpression(node))
	{
		return callExpressionVisitor(node, context);
	}

	return ts.visitEachChild(node, context.visitor, context.transformationContext);
}