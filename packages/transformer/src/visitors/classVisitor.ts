import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import * as ts                     from "typescript";
import { Context }                 from "../contexts/Context";
import { toExpression }            from "../utils/toExpression";

export function classVisitor(declaration: ts.ClassDeclaration, context: Context): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(declaration);
	const typeReference = context.metadata.referenceType(
		type,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined, // context.typeChecker.typeToTypeNode(type, declaration, NodeBuilderFlags.None)
		context
	);

	return [
		context.createNestedContext(
			visitClassDeclaration,
			undefined,
			nestContext => {
				return ts.visitEachChild(
					declaration,
					nestContext.visitor,
					context.transformationContext
				);
			}
		),

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

function visitClassDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	if (ts.isPropertyDeclaration(node))
	{
		if (node.initializer && ts.isClassExpression(node.initializer))
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

			return ts.factory.updatePropertyDeclaration(
				node,
				node.modifiers,
				node.name,
				node.questionToken,
				node.type,
				ts.factory.updateClassExpression(
					node.initializer,
					node.initializer.modifiers,
					node.initializer.name,
					node.initializer.typeParameters,
					node.initializer.heritageClauses,
					node.initializer.members.concat(
						ts.factory.createClassStaticBlockDeclaration(
							ts.factory.createBlock([
									ts.factory.createExpressionStatement(
										ts.factory.createBinaryExpression(
											ts.factory.createElementAccessExpression(
												ts.factory.createPropertyAccessExpression(
													ts.factory.createIdentifier("this"),
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
						)
					)
				)
			);
		}
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
		// TODO: Invoke methodVisitor
	}

	if (ts.isConstructorDeclaration(node))
	{
		// TODO: Invoke constructorVisitor
	}

	return node;
}