import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import * as ts                     from "typescript";
import { NodeBuilderFlags }        from "typescript";
import { Context }                 from "../contexts/Context";
import { createValueExpression }   from "../utils/createValueExpression";

export function classVisitor(declaration: ts.ClassDeclaration, context: Context): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(declaration);
	const typeReference = context.metadata.referenceType(
		type,
		context.typeChecker.typeToTypeNode(type, declaration, NodeBuilderFlags.None),
		context
	);

	return [
		context.createNestedContext(visitClassDeclaration, nestContext => {
			return ts.visitEachChild(
				declaration,
				nestContext.visitor,
				context.transformationContext
			);
		}),

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
				createValueExpression(typeReference)
			)
		)
	];
}

function visitClassDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	if (ts.isPropertyDeclaration(node))
	{
		
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
		
	}

	if (ts.isConstructorDeclaration(node))
	{

	}

	return node;
}