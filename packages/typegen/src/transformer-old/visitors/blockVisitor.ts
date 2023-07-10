// import { PROTOTYPE_TYPE_PROPERTY }      from "@rttist/core";
// import * as ts                          from "typescript";
// import { Context }                      from "../contexts/Context";
// import {
// 	getType,
// 	hasReflectJsDoc,
// 	isNodeIgnored
// }                                       from "../helpers";
// import { log }                          from "../log";
// import { processDecorator }             from "../transformers/processDecorator";
// import { processGenericCallExpression } from "../transformers/processGenericCallExpression";
// import { updateGetTypeCallExpression }  from "../transformers/updateGetTypeCallExpression";
//
// export function blockVisitor(node: ts.Block | ts.Expression, context: Context): ts.VisitResult<ts.Block| ts.Expression>
// {
// 	// Is it call expression? But not decorator! Decorators are handled in separated block.
// 	if (ts.isCallExpression(node) && (!node.parent || !ts.isDecorator(node.parent)))
// 	{
// 		// If it's already processed and re-generated call node, do not visit it.
// 		// If it is generated, it has no position -> -1.
// 		if (isNodeIgnored(node))
// 		{
// 			return node;
// 		}
//
// 		// Reflect.getType<TType>()
// 		if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.escapedText === "getType"
// 			&& ts.isIdentifier(node.expression.expression) && node.expression.expression.escapedText === "Reflect")
// 		{
// 			// // Function/method type
// 			// const fncType = context.typeChecker.getTypeAtLocation(node.expression.expression);
// 			//
// 			// // Check if it's our getType<T>() by checking it has our special static property.
// 			// if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
// 			// {
// 			const res = updateGetTypeCallExpression(context, node);
//
// 			if (res)
// 			{
// 				return res;
// 			}
// 			// }
// 		}
//
// 			// SOMETHING<TType>()
// 		// It is call of some other function
// 		else
// 		{
// 			let identifier: ts.Identifier | ts.PrivateIdentifier | undefined = undefined;
//
// 			if (ts.isIdentifier(node.expression))
// 			{
// 				identifier = node.expression;
// 			}
// 			else if (ts.isPropertyAccessExpression(node.expression)) // TODO: Test it. It may be property access of property access.
// 			{
// 				identifier = node.expression.name;
// 			}
//
// 			if (identifier !== undefined)
// 			{
// 				const type = context.typeChecker.getTypeAtLocation(identifier);
//
// 				// If call expression has typeArguments OR declaration of called function/method has type parameters.
// 				// Later there is check if the declaration has the @reflect JSDoc comment.
// 				if (node.typeArguments?.length || (type.getSymbol()?.valueDeclaration as ts.FunctionLikeDeclaration | undefined)?.typeParameters?.length)
// 				{
// 					const res = processGenericCallExpression(context, node, type);
//
// 					if (res)
// 					{
// 						return ts.visitEachChild(res, context.visitor, context.transformationContext);
// 					}
// 				}
// 				else
// 				{
// 					log.info(`There is an callExpression '${identifier.escapedText}' but no declaration has been found.`);
// 				}
// 			}
// 		}
// 	}
// 	// DECORATOR usage - Assign Type's Id to its prototype
// 	else if (ts.isDecorator(node)
// 		&& (
// 			ts.isClassDeclaration(node.parent)
// 			|| ts.isPropertyDeclaration(node.parent)
// 			|| ts.isMethodDeclaration(node.parent)
// 			|| ts.isGetAccessorDeclaration(node.parent)
// 			|| ts.isSetAccessorDeclaration(node.parent)
// 		)
// 	)
// 	{
// 		// type of decorator
// 		let type: ts.Type | undefined = undefined;
// 		let symbol: ts.Symbol | undefined = undefined;
//
// 		if (ts.isCallExpression(node.expression))
// 		{
// 			type = context.typeChecker.getTypeAtLocation(node.expression.expression);
// 			symbol = type.getSymbol();
// 		}
// 		else if (ts.isIdentifier(node.expression))
// 		{
// 			symbol = context.typeChecker.getSymbolAtLocation(node.expression);
//
// 			if (symbol)
// 			{
// 				type = getType(symbol, context);
// 			}
// 		}
//
// 		if (type && hasReflectJsDoc(symbol))
// 		{
// 			const res = processDecorator(node, type, context);
//
// 			if (res)
// 			{
// 				return ts.visitEachChild(res, context.visitor, context.transformationContext);
// 			}
// 		}
// 	}
// 	// CLASS Declaration - Assign Type's Id to its prototype
// 	else if (ts.isClassDeclaration(node))
// 	{
// 		const typeId = (context.typeChecker.getTypeAtLocation(node) as any).id;
// 		// const typeId = (context.typeChecker.getTypeAtLocation(node).symbol as any).id;
//
// 		if (typeId)
// 		{
// 			// Generate assignment of class's type ID to its prototype
// 			return [
// 				ts.visitEachChild(node, context.visitor, context.transformationContext),
//
// 				// EMIT: ClassIdentifier.prototype[REFLECTED_TYPE_ID] = typeId;
// 				ts.factory.createExpressionStatement(
// 					ts.factory.createBinaryExpression(
// 						ts.factory.createElementAccessExpression(
// 							ts.factory.createPropertyAccessExpression(
// 								node.name as ts.Expression,
// 								"prototype"
// 							),
// 							ts.factory.createStringLiteral(PROTOTYPE_TYPE_PROPERTY)
// 						),
// 						ts.factory.createToken(ts.SyntaxKind.EqualsToken),
// 						ts.factory.createNumericLiteral(typeId)
// 					)
// 				)
// 			];
// 		}
// 	}
//	
// 	return node;
//
// 	// return ts.visitEachChild(node, context.visitor, context.transformationContext);
// }