// import * as ts                   from "typescript";
// import { Context }               from "../contexts/Context";
// import { callExpressionVisitor } from "./callExpressionVisitor";
// // import { updateGetTypeCallExpression } from "../transformers/updateGetTypeCallExpression";
// // import { getDeclaration }              from "../utils/symbolHelpers";
//
// // const GETTYPE_FUNCTION_NAME = "getType" as const;
//
// export function statementVisitor<TNode extends ts.Statement>(node: TNode, context: Context): ts.VisitResult<ts.Node>
// {
// 	return context.createNestedContext(
// 		visit,
// 		undefined,
// 		nestedContext => ts.visitEachChild(
// 			node,
// 			// visit(node, context), 
// 			nestedContext.visitor,
// 			context.transformationContext
// 		)
// 	);
// }
//
// // function isGetTypeCallExpression(node: ts.CallExpression, context: Context)
// // {
// // 	// Return FALSE if it's not getType()
// // 	if ((node.expression as any).escapedText != GETTYPE_FUNCTION_NAME)
// // 	{
// // 		return false;
// // 	}
// //
// // 	let genericTypeNode: ts.TypeNode | undefined = node.typeArguments?.[0];
// //
// // 	// Return FALSE if it has no type arguments.
// // 	if (!genericTypeNode)
// // 	{
// // 		return false;
// // 	}
// //
// // 	// Check if it's our getType()
// // 	if (!isReflectGetTypeFunction(node.expression, context))
// // 	{
// // 		return false;
// // 	}
// //
// // 	return genericTypeNode;
// // }
// //
// // export function isReflectGetTypeFunction(identifier: ts.Node, context: Context)
// // {
// // 	const symbol = context.typeChecker.getSymbolAtLocation(identifier);
// // 	let node: ts.Node | undefined = symbol && getDeclaration(symbol);
// //
// // 	if (!node)
// // 	{
// // 		return false;
// // 	}
// //
// // 	let depth = 5;
// // 	do
// // 	{
// // 		node = node.parent;
// //
// // 		if (!node)
// // 		{
// // 			return false;
// // 		}
// //
// // 		if (ts.isImportDeclaration(node))
// // 		{
// // 			return ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.includes("rttist");
// // 		}
// //
// // 		depth--;
// // 	} while (depth > 0);
// //
// // 	return false;
// // }
//
// function visit(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
// {
// 	if (ts.isCallExpression(node))
// 	{
// 		return callExpressionVisitor(node, context);
//
// 		// console.log("node.typeArguments.length", node.typeArguments.length);
// 		//
// 		//
// 		// // TODO: Support direct call of getType() imported from the package.
// 		// // Reflect.getType<TType>()
// 		// if (
// 		// 	(
// 		// 		ts.isPropertyAccessExpression(node.expression) && node.expression.name.escapedText === GETTYPE_FUNCTION_NAME
// 		// 		&& ts.isIdentifier(node.expression.expression) && (
// 		// 			node.expression.expression.escapedText === "Reflect"
// 		// 			|| node.expression.expression.escapedText === "Rttist"
// 		// 		)
// 		// 	)
// 		// 	|| (
// 		// 		ts.isIdentifier(node.expression) && node.expression.escapedText === GETTYPE_FUNCTION_NAME
// 		// 	)
// 		// )
// 		// {
// 		// 	// // Function/method type
// 		// 	// const fncType = context.typeChecker.getTypeAtLocation(node.expression.expression);
// 		// 	//
// 		// 	// // Check if it's our getType<T>() by checking it has our special static property.
// 		// 	// if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
// 		// 	// {
// 		// 	return updateGetTypeCallExpression(node, context);
// 		// 	// }
// 		// }
//
// 		// SOMETHING<TType>()
// 		// It is call of some other function
// 		// else
// 		// {
// 		// 	let identifier: ts.Identifier | ts.PrivateIdentifier | undefined = undefined;
// 		//
// 		// 	if (ts.isIdentifier(node.expression))
// 		// 	{
// 		// 		identifier = node.expression;
// 		// 	}
// 		// 	else if (ts.isPropertyAccessExpression(node.expression)) // TODO: Test it. It may be property access of property access.
// 		// 	{
// 		// 		identifier = node.expression.name;
// 		// 	}
// 		//
// 		// 	if (identifier !== undefined)
// 		// 	{
// 		// 		const type = context.typeChecker.getTypeAtLocation(identifier);
// 		//
// 		// 		// If call expression has typeArguments OR declaration of called function/method has type parameters.
// 		// 		// Later there is check if the declaration has the @reflect JSDoc comment.
// 		// 		if (node.typeArguments?.length || (type.getSymbol()?.valueDeclaration as ts.FunctionLikeDeclaration | undefined)?.typeParameters?.length)
// 		// 		{
// 		// 			const res = processGenericCallExpression(context, node, type);
// 		//
// 		// 			if (res)
// 		// 			{
// 		// 				return ts.visitEachChild(res, context.visitor, context.transformationContext);
// 		// 			}
// 		// 		}
// 		// 		else
// 		// 		{
// 		// 			log.info(`There is an callExpression '${identifier.escapedText}' but no declaration has been found.`);
// 		// 		}
// 		// 	}
// 		// }
// 	}
//
// 	return ts.visitEachChild(node, context.visitor, context.transformationContext);
// }