import * as ts                      from "typescript";
import { Context }                  from "../contexts/Context";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import { getDeclaration }           from "../utils/symbolHelpers";
import { toExpression }             from "../utils/toExpression";

function createCallsiteGenerator(node: ts.CallExpression, typeArgTypes: Map<number, ts.Type>, context: Context)
{
	const obj: { [index: number]: TransformerTypeReference } = {};
	for (const [index, type] of typeArgTypes.entries())
	{
		obj[index] = context.metadata.referenceType(
			type,
			undefined, // TODO: We should probably capture symbol too and pass it here
			undefined,
			context
		);
	}

	return ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(
			ts.factory.createIdentifier("Rttist"), // TODO: use consts
			ts.factory.createIdentifier("createCallsite")
		),
		undefined,
		[
			node.expression,
			ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : ts.factory.createVoidZero(),
			toExpression(obj),
			...node.arguments
		]
	);
	
	// return ts.factory.updateCallExpression(
	// 	node,
	// 	ts.factory.createParenthesizedExpression(
	// 		ts.factory.createCommaListExpression([
	// 			ts.factory.createCallExpression(
	// 				ts.factory.createPropertyAccessExpression(
	// 					ts.factory.createIdentifier("Rttist"), // TODO: use consts
	// 					ts.factory.createIdentifier("createCallsite")
	// 				),
	// 				undefined,
	// 				[
	// 					node.expression,
	// 					ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : ts.factory.createVoidZero(),
	// 					toExpression(obj),
	// 					...node.arguments
	// 				]
	// 			),
	// 			node.expression
	// 		])
	// 	),
	// 	node.typeArguments,
	// 	node.arguments
	// );

	// createCallsite accept function and invoke that function inside (problem with context "this")
	// return ts.factory.createCallExpression(
	// 	ts.factory.createPropertyAccessExpression(
	// 		ts.factory.createIdentifier("Rttist"), // TODO: use consts
	// 		ts.factory.createIdentifier("createCallsite")
	// 	),
	// 	undefined,
	// 	[
	// 		node.expression,
	//		obj
	// 	]
	// )
}

export function callExpressionVisitor(node: ts.CallExpression, context: Context)
{
	const typeArgTypes = new Map<number, ts.Type>();

	// If Type Arguments defined
	if (node.typeArguments !== undefined && node.typeArguments.length !== 0)
	{
		for (let index = 0; index < node.typeArguments.length; index++)
		{
			typeArgTypes.set(index, context.typeChecker.getTypeFromTypeNode(node.typeArguments[index]));
		}
	}
	else
	{
		// Try to infer type arguments
		if (!inferTypeArguments(node, typeArgTypes, context))
		{
			return node;
		}
	}

	if (typeArgTypes.size !== 0)
	{

		console.log(...Array.from(typeArgTypes.entries()).map(([index, t]) => [index, t?.symbol?.name || ts.TypeFlags[t.flags]]));

		return createCallsiteGenerator(
			ts.visitEachChild(node, context.visitor, context.transformationContext),
			typeArgTypes,
			context
		);
	}

	return ts.visitEachChild(node, context.visitor, context.transformationContext);
}

function inferTypeArguments(node: ts.CallExpression, typeArgTypes: Map<number, ts.Type>, context: Context): boolean
{
	const symbol = context.typeChecker.getSymbolAtLocation(node.expression);
	let declaration: ts.SignatureDeclarationBase | undefined = symbol && getDeclaration(symbol);

	if (!declaration)
	{
		context.log.info(`There is an callExpression '${node.expression.getText()}' but no declaration has been found.`);
		return false;
	}

	// Return node, there is no type parameter, so there is nothing to do (no type info to pass).
	if (declaration.typeParameters === undefined || declaration.typeParameters.length === 0)
	{
		return false;
	}

	const typeParametersTypes = declaration.typeParameters.map(tp => context.typeChecker.getTypeAtLocation(tp));

	// Find parameters of generic type
	for (let paramIndex = 0; paramIndex < declaration.parameters.length; paramIndex++)
	{
		const parameter: ts.ParameterDeclaration = declaration.parameters[paramIndex];

		// Type of the parameter
		let typeArgumentType = context.typeChecker.getTypeAtLocation(parameter);

		// If the parameter is type parameter
		if (typeArgumentType.flags === ts.TypeFlags.TypeParameter)
		{
			const indexOfTypeParam = typeParametersTypes.indexOf(typeArgumentType);

			if (indexOfTypeParam !== -1)
			{
				typeArgTypes.set(
					indexOfTypeParam,
					context.typeChecker.getTypeAtLocation(node.arguments[paramIndex])
				);
			}
		}
	}

	return true;
}


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
// import { processGetTypeCallExpression } from "../transformers/processGetTypeCallExpression";
// import DeclarationVisitor               from "./declarationVisitor";
//
// export function callExpressionVisitor(nodeToVisit: ts.Node, context: Context): ts.VisitResult<ts.Node>
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
// 			const res = processGetTypeCallExpression(context, node);
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
// 	// return ts.visitEachChild(node, context.visitor, context.transformationContext);
// }