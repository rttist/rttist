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
			const argTypeNode = node.typeArguments[index];

			typeArgTypes.push([
				context.typeChecker.getTypeFromTypeNode(argTypeNode),
				ts.isTypeReferenceNode(argTypeNode)
					? context.typeChecker.getSymbolAtLocation(argTypeNode.typeName)
					: undefined
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