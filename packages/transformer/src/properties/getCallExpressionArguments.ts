// import { Context }          from "../contexts/Context";
// import * as ts              from "typescript";
// import { getConstantValue } from "./getConstantValue";
//
// export function getCallExpressionArguments(node: ts.CallExpression, context: Context)
// {
// 	const args: Array<string | number | boolean | ts.PseudoBigInt | ts.PrimaryExpression> = [];
//
// 	for (let arg of node.arguments)
// 	{
// 		args.push(getConstantValue(node, context));
// 	}
//
// 	return args;
// }