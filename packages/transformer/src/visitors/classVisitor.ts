import { PROTOTYPE_TYPE_PROPERTY }  from "@rttist/core";
import * as ts                      from "typescript";
import { SELF_VAR_NAME }            from "../consts";
import { Context }                  from "../contexts/Context";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import { toExpression }             from "../utils/toExpression";
import { functionVisitor }          from "./functionVisitor";

export function classVisitor(
	declaration: ts.ClassDeclaration | ts.ClassExpression,
	context: Context
): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(declaration);
	const typeReference = context.metadata.referenceType(
		type,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined, // context.typeChecker.typeToTypeNode(type, declaration, NodeBuilderFlags.None)
		context
	);

	const visitedDeclaration = context.visitWithNewContext(
		declaration,
		visitClassDeclaration
	);

	if (ts.isClassDeclaration(visitedDeclaration))
	{
		return ts.factory.updateClassDeclaration(
			visitedDeclaration,
			visitedDeclaration.modifiers,
			visitedDeclaration.name,
			visitedDeclaration.typeParameters,
			visitedDeclaration.heritageClauses,
			visitedDeclaration.members.concat([
				// static { this.prototype[REFLECTED_TYPE_ID] = typeId; }
				createClassStaticBlockDeclaration(typeReference)
			])
		);
	}

	if (ts.isClassExpression(visitedDeclaration))
	{
		return ts.factory.updateClassExpression(
			visitedDeclaration,
			visitedDeclaration.modifiers,
			visitedDeclaration.name,
			visitedDeclaration.typeParameters,
			visitedDeclaration.heritageClauses,
			visitedDeclaration.members.concat([
				// static { this.prototype[REFLECTED_TYPE_ID] = typeId; }
				createClassStaticBlockDeclaration(typeReference)
			])
		);
	}

	return visitedDeclaration;
}

function visitClassDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	if (ts.isPropertyDeclaration(node))
	{
		if (node.initializer)
		{
			if (ts.isClassExpression(node.initializer))
			{
				const symbol = (node as any).symbol || context.typeChecker.getSymbolAtLocation(node.name);
				const type = context.typeChecker.getDeclaredTypeOfSymbol(
					(node.initializer as any).symbol || context.typeChecker.getSymbolAtLocation(node.initializer)
				);
				const typeReference = context.metadata.referenceType(
					type,
					symbol,
					undefined,
					context
				);
				const classDeclaration = (context.node as ts.ClassDeclaration | ts.ClassExpression);
				const updatedDeclaration = context.visitWithNewContext(
					node.initializer,
					visitClassDeclaration
				) as ts.ClassExpression;

				const thisArg = ts.factory.createIdentifier(SELF_VAR_NAME + classDeclaration.name?.escapedText ?? "");

				return ts.factory.updatePropertyDeclaration(
					node,
					node.modifiers,
					node.name,
					node.questionToken,
					node.type,
					ts.factory.createCallExpression(
						ts.factory.createParenthesizedExpression(
							ts.factory.createFunctionExpression(
								undefined,
								undefined,
								undefined,
								undefined,
								[
									ts.factory.createParameterDeclaration(
										undefined,
										undefined,
										thisArg
									)
								],
								undefined,
								ts.factory.createBlock([
									ts.factory.createReturnStatement(
										ts.factory.updateClassExpression(
											updatedDeclaration,
											updatedDeclaration.modifiers,
											updatedDeclaration.name,
											updatedDeclaration.typeParameters,
											updatedDeclaration.heritageClauses,
											updatedDeclaration.members.concat(
												// static { this.prototype[REFLECTED_TYPE_ID] = typeId; }
												createClassStaticBlockDeclaration(typeReference)
											)
										)
									)
								])
							)
						),
						undefined,
						[
							ts.factory.createThis()
						]
					)
				);
			}

			return ts.visitEachChild(node, context.visitor, context.transformationContext) as ts.PropertyDeclaration;
		}

		return node;
	}

	if (ts.isGetAccessorDeclaration(node))
	{

	}

	if (ts.isSetAccessorDeclaration(node))
	{

	}

	// Index signature has no implementation to alter.
	// if (ts.isIndexSignatureDeclaration(node))
	// {
	//	
	// }

	if (ts.isMethodDeclaration(node))
	{
		return functionVisitor(node, context);
	}

	if (ts.isConstructorDeclaration(node))
	{
		return functionVisitor(node, context);
	}

	return node;
}

function createClassStaticBlockDeclaration(typeReference: TransformerTypeReference)
{
	return ts.factory.createClassStaticBlockDeclaration(
		ts.factory.createBlock([
				ts.factory.createExpressionStatement(
					ts.factory.createBinaryExpression(
						ts.factory.createElementAccessExpression(
							ts.factory.createPropertyAccessExpression(
								ts.factory.createThis(),
								"prototype"
							),
							ts.factory.createStringLiteral(PROTOTYPE_TYPE_PROPERTY)
						),
						ts.factory.createToken(ts.SyntaxKind.EqualsToken),
						toExpression(typeReference)
					)
				)
			]
		)
	);
}