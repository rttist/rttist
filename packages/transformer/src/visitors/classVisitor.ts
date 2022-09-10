import { PROTOTYPE_TYPE_PROPERTY } from "@rtti/core";
import * as ts                     from "typescript";
import { NodeBuilderFlags }        from "typescript";
import { Context }                 from "../contexts/Context";
import { createValueExpression }   from "../utils/createValueExpression";

export function classVisitor(classDeclaration: ts.ClassDeclaration, context: Context): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(classDeclaration);
	const typeReference = context.metadata.addTypeAndOrGetId(
		type,
		context.typeChecker.typeToTypeNode(type, classDeclaration, NodeBuilderFlags.None),
		context
	);

	return [
		ts.visitEachChild(
			classDeclaration,
			(node: ts.Node) => visitClassDeclaration(node, context),
			context.transformationContext
		),

		// EMIT: ClassIdentifier.prototype[REFLECTED_TYPE_ID] = typeId;
		ts.factory.createExpressionStatement(
			ts.factory.createBinaryExpression(
				ts.factory.createElementAccessExpression(
					ts.factory.createPropertyAccessExpression(
						classDeclaration.name as ts.Expression,
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
	if (ts.isMethodDeclaration(node))
	{
		
	}

	if (ts.isConstructorDeclaration(node))
	{

	}

	return node;
}