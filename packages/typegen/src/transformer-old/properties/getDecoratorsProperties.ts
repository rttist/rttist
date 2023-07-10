import { Context }                from "../contexts/Context";
import * as ts                    from "typescript";
import { DecoratorProperties }    from "../declarations/TypeProperties";
import { getDecorators }          from "../utils/getDecorators";
import { getDecoratorProperties } from "./getDecoratorProperties";

export function getDecoratorsProperties(node: ts.Declaration, context: Context): Array<DecoratorProperties> | undefined
{
	const decorators = getDecorators(node);

	if (decorators === undefined)
	{
		return undefined;
	}

	const decoratorProperties: Array<DecoratorProperties> = [];

	for (const decorator of decorators)
	{
		decoratorProperties.push(getDecoratorProperties(decorator, context));
	}

	return decoratorProperties.length === 0 ? undefined : decoratorProperties;
}