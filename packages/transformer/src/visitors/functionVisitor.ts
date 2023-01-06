import {
	FncNames,
	PROTOTYPE_TYPE_PROPERTY,
	RTTIST_NAMESPACE
}                                             from "@rttist/core";
import * as ts                                from "typescript";
import { TYPE_PARAMS_VAR_NAME }               from "../consts";
import { Context }                            from "../contexts/Context";
import { TransformerTypeReference }           from "../declarations/TransformerTypeReference";
import { directTypeCallsiteReferenceFactory } from "../utils/directTypeCallsiteReferenceFactory";
import { toExpression }                       from "../utils/toExpression";
import { mainVisitor }                        from "./mainVisitor";

export function functionVisitor(
	declaration: ts.FunctionLikeDeclarationBase,
	context: Context
): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(declaration);
	const typeParameters: string[] = declaration.typeParameters?.map(tp => tp.name.escapedText + "") ?? [];

	const typeReference = context.metadata.referenceType(
		type,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined,
		context
	);

	declaration = context.visitWithNewContext(
		declaration,
		visitFunctionDeclaration
	) as ts.FunctionLikeDeclarationBase;

	const functionName = declaration.name || ts.factory.createIdentifier(
		"__fn" + (context.typeChecker.getTypeAtLocation(declaration) as any).id
	);

	if (ts.isFunctionDeclaration(declaration))
	{
		declaration = ts.factory.updateFunctionDeclaration(
			declaration,
			declaration.modifiers,
			declaration.asteriskToken,
			functionName as ts.Identifier,
			declaration.typeParameters,
			declaration.parameters,
			declaration.type,
			recreateBody(typeParameters, functionName as ts.Identifier, declaration.body)
		);

		return [
			declaration,

			// EMIT: Function.prototype[REFLECTED_TYPE_ID] = typeId;
			createPrototypeTypeIdAssignment(functionName as ts.Identifier, typeReference)
		];
	}
	
	if (ts.isMethodDeclaration(declaration))
	{
		return ts.factory.updateMethodDeclaration(
			declaration,
			declaration.modifiers,
			declaration.asteriskToken,
			functionName as ts.Identifier,
			declaration.questionToken,
			declaration.typeParameters,
			declaration.parameters,
			declaration.type,
			recreateBody(typeParameters, functionName as ts.Identifier, declaration.body)
		);
	}
	
	if (ts.isFunctionExpression(declaration))
	{
		declaration = ts.factory.updateFunctionExpression(
			declaration,
			declaration.modifiers,
			declaration.asteriskToken,
			functionName as ts.Identifier,
			declaration.typeParameters,
			declaration.parameters,
			declaration.type,
			recreateBody(typeParameters, functionName as ts.Identifier, declaration.body)
		);

		const localFnName = ts.factory.createIdentifier("f");

		return ts.factory.createCallExpression(
			ts.factory.createParenthesizedExpression(
				ts.factory.createFunctionExpression(
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					ts.factory.createBlock([
						ts.factory.createVariableStatement(
							undefined,
							ts.factory.createVariableDeclarationList(
								[
									ts.factory.createVariableDeclaration(localFnName, undefined, undefined, declaration as ts.FunctionExpression)
								],
								ts.NodeFlags.Const
							)
						),
						// EMIT: Function.prototype[REFLECTED_TYPE_ID] = typeId;
						createPrototypeTypeIdAssignment(localFnName, typeReference),
						ts.factory.createReturnStatement(localFnName)
					])
				)
			),
			undefined,
			undefined
		);
	}

	context.log.warn("Unknown function kind.");

	return declaration;
}

function visitFunctionDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	return mainVisitor(node, context);
}

function createCallsiteVariableStatement(
	typeParameters: string[],
	functionName: ts.Identifier
)
{
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
						functionName
					]
				)
			)
		], ts.NodeFlags.Const)
	);
}

function recreateBody(typeParameters: string[], functionName: ts.Identifier, body: ts.Block | undefined)
{
	return ts.factory.createBlock(
		[
			// Declare variables for access to TypeParameters from Callsite
			createCallsiteVariableStatement(typeParameters, functionName),
			body ?? ts.factory.createEmptyStatement()
		]
	);
}

function createPrototypeTypeIdAssignment(
	identifier: ts.Identifier,
	typeReference: TransformerTypeReference
)
{
	return ts.factory.createExpressionStatement(
		ts.factory.createBinaryExpression(
			ts.factory.createElementAccessExpression(
				ts.factory.createPropertyAccessExpression(
					identifier,
					"prototype"
				),
				ts.factory.createStringLiteral(PROTOTYPE_TYPE_PROPERTY)
			),
			ts.factory.createToken(ts.SyntaxKind.EqualsToken),
			toExpression(typeReference)
		)
	);
}