import * as ts                         from "typescript";
import { Context }                     from "../contexts/Context";
import { getType }                     from "../helpers";
import { updateGetTypeCallExpression } from "../transformers/updateGetTypeCallExpression";

export function statementVisitor<TNode extends ts.Statement>(node: TNode, context: Context): ts.VisitResult<ts.Node>
{
	return context.createNestedContext(
		visit,
		nestedContext => ts.visitEachChild(
			node,
			// visit(node, context), 
			nestedContext.visitor,
			context.transformationContext
		)
	);
}

function visit(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	if (ts.isCallExpression(node) && node.typeArguments?.length)
	{
		// TODO: Support direct call of getType() imported from the package.
		// Reflect.getType<TType>()
		if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.escapedText === "getType"
			&& ts.isIdentifier(node.expression.expression) && node.expression.expression.escapedText === "Reflect")
		{
			// // Function/method type
			// const fncType = context.typeChecker.getTypeAtLocation(node.expression.expression);
			//
			// // Check if it's our getType<T>() by checking it has our special static property.
			// if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
			// {
			return updateGetTypeCallExpression(context, node);
			// }
		}

		// SOMETHING<TType>()
		// It is call of some other function
		// else
		// {
		// 	let identifier: ts.Identifier | ts.PrivateIdentifier | undefined = undefined;
		//
		// 	if (ts.isIdentifier(node.expression))
		// 	{
		// 		identifier = node.expression;
		// 	}
		// 	else if (ts.isPropertyAccessExpression(node.expression)) // TODO: Test it. It may be property access of property access.
		// 	{
		// 		identifier = node.expression.name;
		// 	}
		//
		// 	if (identifier !== undefined)
		// 	{
		// 		const type = context.typeChecker.getTypeAtLocation(identifier);
		//
		// 		// If call expression has typeArguments OR declaration of called function/method has type parameters.
		// 		// Later there is check if the declaration has the @reflect JSDoc comment.
		// 		if (node.typeArguments?.length || (type.getSymbol()?.valueDeclaration as ts.FunctionLikeDeclaration | undefined)?.typeParameters?.length)
		// 		{
		// 			const res = processGenericCallExpression(context, node, type);
		//
		// 			if (res)
		// 			{
		// 				return ts.visitEachChild(res, context.visitor, context.transformationContext);
		// 			}
		// 		}
		// 		else if (context.config.debugMode)
		// 		{
		// 			log.info(`There is an callExpression '${identifier.escapedText}' but no declaration has been found.`);
		// 		}
		// 	}
		// }
	}

	return ts.visitEachChild(node, context.visitor, context.transformationContext);
}