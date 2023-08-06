import * as ts from "typescript";
import { DecoratorProperties } from "../../../declarations/type-properties";
import { ERROR_PLACEHOLDER_STRING } from "../consts";
import { Context } from "../contexts/context";
import { getConstantValue } from "./getConstantValue";

export function getDecoratorProperties(decorator: ts.Decorator, context: Context): DecoratorProperties {
	let callExpression;
	const expression = (callExpression = ts.isCallExpression(decorator.expression))
		? decorator.expression.expression
		: decorator.expression;

	// context.typeChecker

	return {
		// id: getTypeId(type, false, symbol, context.transformerContext),
		// TODO: Review
		id: context.transformerContext.syntaxTypeChecker.getType(expression).id,
		name: ts.isIdentifier(expression) ? expression.text : ERROR_PLACEHOLDER_STRING,
		args: callExpression
			? (decorator.expression as ts.CallExpression).arguments.map((argument) =>
					getConstantValue(argument, context)
			  )
			: undefined,
	} as DecoratorProperties;
}
