import * as ts                    from "typescript";
import { Context }                from "../contexts/Context";
import { isInterestingStatement } from "../utils/isInterestingStatement";
import { classVisitor }           from "./classVisitor";
import { functionVisitor }        from "./functionVisitor";
import { interfaceVisitor }       from "./interfaceVisitor";
import { statementVisitor }       from "./statementVisitor";
import { typeAliasVisitor }       from "./typeAliasVisitor";

/**
 * Main visitor, splitting visitation into specific parts
 * @param nodeToVisit
 * @param context
 */
export function mainVisitor(nodeToVisit: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	switch (nodeToVisit.kind)
	{
		case  ts.SyntaxKind.ClassDeclaration:
			return classVisitor(nodeToVisit as unknown as ts.ClassDeclaration, context);
		case  ts.SyntaxKind.InterfaceDeclaration:
			return interfaceVisitor(nodeToVisit as unknown as ts.InterfaceDeclaration, context);
		case  ts.SyntaxKind.TypeAliasDeclaration:
			return typeAliasVisitor(nodeToVisit as unknown as ts.TypeAliasDeclaration, context);
		case  ts.SyntaxKind.FunctionDeclaration:
			return functionVisitor(nodeToVisit as unknown as ts.FunctionDeclaration, context);
		// Interesting Statement
		case  ts.SyntaxKind.ExpressionStatement:
		case  ts.SyntaxKind.WhileStatement:
		case  ts.SyntaxKind.DoStatement:
		case  ts.SyntaxKind.ForStatement:
		case  ts.SyntaxKind.ForInStatement:
		case  ts.SyntaxKind.ForOfStatement:
		case  ts.SyntaxKind.IfStatement:
		case  ts.SyntaxKind.SwitchStatement:
		case  ts.SyntaxKind.ThrowStatement:
		case  ts.SyntaxKind.TryStatement:
		case  ts.SyntaxKind.VariableStatement:
		case  ts.SyntaxKind.WithStatement:
		case  ts.SyntaxKind.Block:
			return statementVisitor(nodeToVisit as ts.Statement, context);
	}

	// if (ts.isClassDeclaration(nodeToVisit))
	// {
	// 	return classVisitor(nodeToVisit, context);
	// }
	//
	// if (ts.isInterfaceDeclaration(nodeToVisit))
	// {
	// 	return interfaceVisitor(nodeToVisit, context);
	// }
	//
	// if (ts.isTypeAliasDeclaration(nodeToVisit))
	// {
	// 	return typeAliasVisitor(nodeToVisit, context);
	// }
	//
	// if (ts.isFunctionDeclaration(nodeToVisit))
	// {
	// 	return functionVisitor(nodeToVisit, context);
	// }
	//
	// if (isInterestingStatement(nodeToVisit))
	// {
	// 	return statementVisitor(nodeToVisit, context);
	// }

	return ts.visitEachChild(nodeToVisit, context.visitor, context.transformationContext);


	/*
	
	if ((ts.isMethodDeclaration(nodeToVisit) || ts.isFunctionDeclaration(nodeToVisit)))
	{
		const visitedDeclaration = DeclarationVisitor.instance.visitDeclaration(nodeToVisit, context);

		if (visitedDeclaration === undefined)
		{
			return nodeToVisit;
		}

		nodeToVisit = visitedDeclaration;
	}

	const node = nodeToVisit;

	// Is it call expression? But not decorator! Decorators are handled in separated block.
	if (ts.isCallExpression(node) && (!node.parent || !ts.isDecorator(node.parent)))
	{
		// If it's already processed and re-generated call node, do not visit it.
		// If it is generated, it has no position -> -1.
		if (isNodeIgnored(node))
		{
			return node;
		}

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
			const res = processGetTypeCallExpression(context, node);

			if (res)
			{
				return res;
			}
			// }
		}

			// SOMETHING<TType>()
		// It is call of some other function
		else
		{
			let identifier: ts.Identifier | ts.PrivateIdentifier | undefined = undefined;

			if (ts.isIdentifier(node.expression))
			{
				identifier = node.expression;
			}
			else if (ts.isPropertyAccessExpression(node.expression)) // TODO: Test it. It may be property access of property access.
			{
				identifier = node.expression.name;
			}

			if (identifier !== undefined)
			{
				const type = context.typeChecker.getTypeAtLocation(identifier);

				// If call expression has typeArguments OR declaration of called function/method has type parameters.
				// Later there is check if the declaration has the @reflect JSDoc comment.
				if (node.typeArguments?.length || (type.getSymbol()?.valueDeclaration as ts.FunctionLikeDeclaration | undefined)?.typeParameters?.length)
				{
					const res = processGenericCallExpression(context, node, type);

					if (res)
					{
						return ts.visitEachChild(res, context.visitor, context.transformationContext);
					}
				}
				else
				{
					log.info(`There is an callExpression '${identifier.escapedText}' but no declaration has been found.`);
				}
			}
		}
	}
	// DECORATOR usage - Assign Type's Id to its prototype
	else if (ts.isDecorator(node)
		&& (
			ts.isClassDeclaration(node.parent)
			|| ts.isPropertyDeclaration(node.parent)
			|| ts.isMethodDeclaration(node.parent)
			|| ts.isGetAccessorDeclaration(node.parent)
			|| ts.isSetAccessorDeclaration(node.parent)
		)
	)
	{
		// type of decorator
		let type: ts.Type | undefined = undefined;
		let symbol: ts.Symbol | undefined = undefined;

		if (ts.isCallExpression(node.expression))
		{
			type = context.typeChecker.getTypeAtLocation(node.expression.expression);
			symbol = type.getSymbol();
		}
		else if (ts.isIdentifier(node.expression))
		{
			symbol = context.typeChecker.getSymbolAtLocation(node.expression);

			if (symbol)
			{
				type = getType(symbol, context);
			}
		}

		if (type && hasReflectJsDoc(symbol))
		{
			const res = processDecorator(node, type, context);

			if (res)
			{
				return ts.visitEachChild(res, context.visitor, context.transformationContext);
			}
		}
	}
	// CLASS Declaration - Assign Type's Id to its prototype
	else if (ts.isClassDeclaration(node))
	{
		const typeId = (context.typeChecker.getTypeAtLocation(node) as any).id;
		// const typeId = (context.typeChecker.getTypeAtLocation(node).symbol as any).id;

		if (typeId)
		{
			// Generate assignment of class's type ID to its prototype
			return [
				ts.visitEachChild(node, context.visitor, context.transformationContext),

				// EMIT: ClassIdentifier.prototype[REFLECTED_TYPE_ID] = typeId;
				ts.factory.createExpressionStatement(
					ts.factory.createBinaryExpression(
						ts.factory.createElementAccessExpression(
							ts.factory.createPropertyAccessExpression(
								node.name as ts.Expression,
								"prototype"
							),
							ts.factory.createStringLiteral(PROTOTYPE_TYPE_PROPERTY)
						),
						ts.factory.createToken(ts.SyntaxKind.EqualsToken),
						ts.factory.createNumericLiteral(typeId)
					)
				)
			];
		}
	}

	return ts.visitEachChild(node, context.visitor, context.transformationContext);
	*/
}
