import * as ts                     from "typescript";
import type { TransformerContext } from "../contexts/TransformerContext";
import type { MetadataSource }     from "../declarations/TypeProperties";
import type {
	MetadataMiddleware,
	MiddlewareContext,
	MiddlewareResult,
	NextMetadataMiddleware
}                                  from "./index";
import { shortArraySerializer }    from "./shortArraySerializer";

export function processMiddlewares(transformerContext: TransformerContext, source: MetadataSource): MiddlewareResult
{
	const middlewares: MetadataMiddleware[] = transformerContext.config.metadataMiddlewares;

	// Add our default middleware
	middlewares.push(shortArraySerializer);

	// MIDDLEWARES
	let middlewareIndex = 0;
	let middlewareResult: MiddlewareResult | undefined = undefined;

	const middlewareContext: MiddlewareContext = {
		transformerContext,
		metadata: source,
		get result(): MiddlewareResult | undefined
		{
			return middlewareResult;
		},
		setResult(expression: MiddlewareResult)
		{
			middlewareResult = expression;
		}
	};

	const nextMetadataMiddleware: NextMetadataMiddleware = {
		invoke()
		{
			middlewares[middlewareIndex++]?.(middlewareContext, nextMetadataMiddleware);
		}
	};

	nextMetadataMiddleware.invoke();

	if (middlewareResult)
	{
		return middlewareResult;
	}

	return ts.factory.createObjectLiteralExpression();
}