import { TYPE_PARAMS_VAR_NAME }   from "../consts";
import type { CallsiteReference } from "../declarations/callsites";
import * as ts                    from "typescript";
import {
	FncNames,
	RTTIST_NAMESPACE
}                                 from "@rttist/core";
import { Context }                from "../contexts/Context";
import { getDeclaration }         from "../utils/symbolHelpers";
import { toExpression }           from "../utils/toExpression";

function createCallsiteCallExpression(
	node: ts.CallExpression,
	callsiteReferences: CallsiteReference
)
{
	return ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(
			ts.factory.createIdentifier(RTTIST_NAMESPACE),
			ts.factory.createIdentifier(FncNames.createCallsite)
		),
		undefined,
		[
			node.expression,
			ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : ts.factory.createVoidZero(),
			ts.factory.createArrayLiteralExpression(callsiteReferences.map(reference => {
				if (typeof (reference) === "string") {
					return ts.factory.createIdentifier(TYPE_PARAMS_VAR_NAME + reference)
				}
				
				return toExpression(reference);
			})),
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
	// const typeArgTypes = new Map<number, [ts.Type, ts.Symbol | undefined]>();
	const typeArgTypes: Array<undefined | [ts.Type, ts.Symbol | undefined]> = [];

	// If Type Arguments defined
	if (node.typeArguments !== undefined && node.typeArguments.length !== 0)
	{
		for (let index = 0; index < node.typeArguments.length; index++)
		{
			typeArgTypes.push([
				context.typeChecker.getTypeFromTypeNode(node.typeArguments[index]),
				context.typeChecker.getSymbolAtLocation(node.typeArguments[index])
			]);
		}
	}
	else
	{
		// Try to infer type arguments
		inferTypeArguments(node, typeArgTypes, context);
	}

	if (typeArgTypes.length !== 0)
	{
		console.log(...typeArgTypes
			// .filter(entry => entry !== null)
			.map(entry => entry === undefined ? undefined : [(entry[1] || entry[0].symbol)?.name || ts.TypeFlags[entry[0].flags]]));

		return createCallsiteCallExpression(
			ts.visitEachChild(node, context.visitor, context.transformationContext),
			context.callsiteReferenceFactory(typeArgTypes, context)
		);
	}

	return ts.visitEachChild(node, context.visitor, context.transformationContext);
}

function inferTypeArguments(
	node: ts.CallExpression,
	typeArgTypes: Array<undefined | [ts.Type, ts.Symbol | undefined]>,
	context: Context
)
{
	const symbol = context.typeChecker.getSymbolAtLocation(node.expression);
	let declaration: ts.SignatureDeclarationBase | undefined = symbol && getDeclaration(symbol);

	if (!declaration)
	{
		context.log.info(`There is an callExpression '${node.expression.getText()}' but no declaration has been found.`);
		return;
	}

	// Return node. There is no type parameter, so there is nothing to do (no type info to pass).
	if (declaration.typeParameters === undefined || declaration.typeParameters.length === 0)
	{
		return;
	}

	const typeParametersTypes = declaration.typeParameters.map(tp => context.typeChecker.getTypeAtLocation(tp));
	const parametersTypes = declaration.parameters.map(tp => context.typeChecker.getTypeAtLocation(tp));

	for (const typeParameterType of typeParametersTypes)
	{
		const parameterIndex = parametersTypes.indexOf(typeParameterType);

		if (parameterIndex !== -1)
		{
			typeArgTypes.push([
				context.typeChecker.getTypeAtLocation(node.arguments[parameterIndex]),
				context.typeChecker.getSymbolAtLocation(node.arguments[parameterIndex])
			]);
		}
		else
		{
			typeArgTypes.push(undefined);
		}
	}

	// // Find parameters of generic type
	// for (let paramIndex = 0; paramIndex < declaration.parameters.length; paramIndex++)
	// {
	// 	const parameter: ts.ParameterDeclaration = declaration.parameters[paramIndex];
	//
	// 	// Type of the parameter
	// 	let typeArgumentType = context.typeChecker.getTypeAtLocation(parameter);
	//
	// 	// If the parameter is type parameter
	// 	if (typeArgumentType.flags === ts.TypeFlags.TypeParameter)
	// 	{
	// 		const indexOfTypeParam = typeParametersTypes.indexOf(typeArgumentType);
	//
	// 		if (indexOfTypeParam !== -1)
	// 		{
	// 			typeArgTypes.set(
	// 				indexOfTypeParam,
	// 				[
	// 					context.typeChecker.getTypeAtLocation(node.arguments[paramIndex]),
	// 					context.typeChecker.getSymbolAtLocation(node.arguments[paramIndex])
	// 				]
	// 			);
	// 		}
	// 	}
	// }
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