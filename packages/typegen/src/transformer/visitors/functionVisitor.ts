import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import * as ts from "typescript";
import { createCallsiteTypeArgumentsReadVariableStatement } from "../ast-utils/createCallsiteTypeArgumentsReadVariableStatement";
import { Config } from "../config/Config";
import { Context } from "../contexts/Context";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import { toExpression } from "../utils/toExpression";
import { mainVisitor } from "./mainVisitor";

export function functionVisitor(
	declaration: ts.FunctionLikeDeclarationBase,
	context: Context
): ts.VisitResult<ts.Node>
{
	const typeParameters: string[] = declaration.typeParameters?.map(tp => tp.name.escapedText + "") ?? [];

	declaration = context.visitWithNewContext(
		declaration,
		visitFunctionDeclaration
	) as ts.FunctionLikeDeclarationBase;

	const functionName = declaration.name || ts.factory.createIdentifier(
		"__fn" + (context.typeChecker.getTypeAtLocation(declaration) as any).id
	);

	if (ts.isFunctionDeclaration(declaration))
	{
		const typeReference = context.metadata.referenceType(
			context.typeChecker.getTypeAtLocation(declaration),
			false,
			context.typeChecker.getSymbolAtLocation(declaration),
			undefined,
			context
		);

		declaration = ts.factory.updateFunctionDeclaration(
			declaration,
			declaration.modifiers,
			declaration.asteriskToken,
			functionName as ts.Identifier,
			declaration.typeParameters,
			declaration.parameters,
			declaration.type,
			recreateBody(typeParameters, functionName as ts.Identifier, declaration)
		);

		return [
			declaration,
			createTypeIdAssignmentExpressionStatement(
				declaration,
				functionName as ts.Identifier,
				typeReference,
				context.config
			)
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
			recreateBody(typeParameters, functionName as ts.Identifier, declaration)
		);
	}

	if (ts.isFunctionExpression(declaration))
	{
		const typeReference = context.metadata.referenceType(
			context.typeChecker.getTypeAtLocation(declaration),
			false,
			context.typeChecker.getSymbolAtLocation(declaration),
			undefined,
			context
		);

		declaration = ts.factory.updateFunctionExpression(
			declaration,
			declaration.modifiers,
			declaration.asteriskToken,
			functionName as ts.Identifier,
			declaration.typeParameters,
			declaration.parameters,
			declaration.type,
			recreateBody(typeParameters, functionName as ts.Identifier, declaration)
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
									ts.factory.createVariableDeclaration(
										localFnName,
										undefined,
										undefined,
										declaration as ts.FunctionExpression
									)
								],
								ts.NodeFlags.Const
							)
						),
						createTypeIdAssignmentExpressionStatement(
							declaration,
							localFnName,
							typeReference,
							context.config
						),
						ts.factory.createReturnStatement(localFnName)
					])
				)
			),
			undefined,
			undefined
		);
	}

	return declaration;
}

function visitFunctionDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	return mainVisitor(node, context);
}

function recreateBody(
	typeParameters: string[],
	functionName: ts.Identifier,
	declaration: ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration
)
{
	return ts.factory.createBlock(
		[
			// Declare variables for access to TypeParameters from Callsite
			createCallsiteTypeArgumentsReadVariableStatement(typeParameters, functionName, declaration),
			declaration.body ?? ts.factory.createEmptyStatement()
		]
	);
}

function createTypeIdAssignmentExpressionStatement(
	declaration: ts.FunctionLikeDeclarationBase,
	functionName: ts.Identifier,
	typeReference: TransformerTypeReference,
	config: Config
): ts.ExpressionStatement
{
	const modifiers = ts.canHaveModifiers(declaration) && ts.getModifiers(declaration);

	// EMIT: Function.prototype[REFLECTED_TYPE_ID] = typeId; or Function[REFLECTED_TYPE_ID] = typeId; for async functions (they have no prototype)
	return modifiers && modifiers.some(token => token.kind === ts.SyntaxKind.AsyncKeyword)
		? createAsyncFunctionTypeIdAssignment(functionName, typeReference, config)
		: createPrototypeTypeIdAssignment(functionName, typeReference, config);
}

function createPrototypeTypeIdAssignment(
	identifier: ts.Identifier,
	typeReference: TransformerTypeReference,
	config: Config
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
			toExpression(typeReference, config)
		)
	);
}

function createAsyncFunctionTypeIdAssignment(
	identifier: ts.Identifier,
	typeReference: TransformerTypeReference,
	config: Config
)
{
	return ts.factory.createExpressionStatement(
		ts.factory.createBinaryExpression(
			ts.factory.createElementAccessExpression(
				identifier,
				ts.factory.createStringLiteral(PROTOTYPE_TYPE_PROPERTY)
			),
			ts.factory.createToken(ts.SyntaxKind.EqualsToken),
			toExpression(typeReference, config)
		)
	);
}