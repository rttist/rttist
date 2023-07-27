import * as ts                  from "typescript";
import { Context }              from "../contexts/Context";
import { getTypeArgumentsInfo } from "./getTypeArgumentsInfo";
import { inferTypeArguments }   from "./inferTypeArguments";

export function getArgumentsTypes(node: ts.CallExpression | ts.NewExpression, context: Context)
{
	// If Type Arguments defined
	if (node.typeArguments !== undefined && node.typeArguments.length !== 0)
	{
		return getTypeArgumentsInfo(node.typeArguments, context);
	}

	// Try to infer type arguments
	return inferTypeArguments(node, context);
}