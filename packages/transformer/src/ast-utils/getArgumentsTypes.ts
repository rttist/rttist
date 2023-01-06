import * as ts                from "typescript";
import { Context }            from "../contexts/Context";
import { inferTypeArguments } from "./inferTypeArguments";

export function getArgumentsTypes(node: ts.CallExpression | ts.NewExpression, context: Context)
{
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
	return typeArgTypes;
}