import {
	CALLSITE_TYPE_ARGS_PROPERTY,
	PROTOTYPE_TYPE_PROPERTY
}                                from "@rttist/core";
import * as ts                   from "typescript";
import { Context }               from "../contexts/Context";
import { toExpression }          from "../utils/toExpression";
import { callExpressionVisitor } from "./callExpressionVisitor";

const TYPE_PARAMS = "__typeParams__";

export function functionVisitor(declaration: ts.FunctionDeclaration, context: Context): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(declaration);
	const typeReference = context.metadata.referenceType(
		type,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined,
		context
	);

	declaration = context.createNestedContext(
		visitFunctionDeclaration,
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
				ts.factory.createVariableStatement(
					undefined,
					[
						ts.factory.createVariableDeclaration(
							TYPE_PARAMS,
							undefined,
							undefined,
							ts.factory.createElementAccessExpression(
								declaration.name!, // TODO: May be undefined
								ts.factory.createStringLiteral(CALLSITE_TYPE_ARGS_PROPERTY)
							)
						)
					]
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