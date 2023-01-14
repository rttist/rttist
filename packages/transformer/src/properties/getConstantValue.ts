import { Context }             from "../contexts/Context";
import * as ts                 from "typescript";
import { getNodeLocationText } from "../tracers/getNodeLocationText";

export function getConstantValue(
	node: ts.Node,
	context: Context
): string | number | boolean | ts.PseudoBigInt | ts.PrimaryExpression
{
	const type = context.typeChecker.getTypeAtLocation(node);

	if (type.isLiteral())
	{
		return type.value;
	}

	if (type.flags & ts.TypeFlags.BooleanLiteral)
	{
		return (type as any).intrinsicName === "true";
	}

	if (context.config.devMode)
	{
		context.log.ifWarn(() => [
			"Unexpected value. Only constant values are allowed.\n\t"
			+ getNodeLocationText(node)
		]);
	}

	return ts.factory.createNull();
}