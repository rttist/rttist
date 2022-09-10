import * as ts                 from "typescript";
import { Context }             from "../contexts/Context";
import { DecoratorProperties } from "../declarations/TypeProperties";
import {
	getSymbol,
	getTypeRef
}                              from "../utils/typeHelpers";
import { getConstantValue }    from "./getConstantValue";

export function getDecoratorProperties(decorator: ts.Decorator, context: Context): DecoratorProperties
{
	let callExpression;
	const expression = (callExpression = ts.isCallExpression(decorator.expression))
		? decorator.expression.expression
		: decorator.expression;

	const type = context.typeChecker.getTypeAtLocation(expression);
	const symbol = getSymbol(type, context.typeChecker);

	return {
		name: symbol!.escapedName,
		id: getTypeRef(type, context.typeChecker),
		args: callExpression
			? (decorator.expression as ts.CallExpression).arguments.map(argument => getConstantValue(argument, context))
			: undefined
	} as DecoratorProperties;
}