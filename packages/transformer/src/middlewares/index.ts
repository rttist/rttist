// import * as ts                     from "typescript";
// import type { TransformerContext } from "../contexts/TransformerContext";
// import type { MetadataSource }     from "../declarations/TypeProperties";
//
// /**
//  * Interface of "Next" middleware object.
//  */
// export interface NextMetadataMiddleware
// {
// 	invoke(): void;
// }
//
// export type MiddlewareResult = ts.CallExpression | ts.ArrayLiteralExpression | ts.ObjectLiteralExpression | ts.LiteralExpression | object | string;
//
// export interface MiddlewareContext
// {
// 	transformerContext: TransformerContext;
// 	metadata: MetadataSource;
// 	result: MiddlewareResult | undefined;
//
// 	setResult(expression: MiddlewareResult): void;
// }
//
// /**
//  * Middleware handling generated type properties before emitting to the result javascript code.
//  */
// export type MetadataMiddleware = (
// 	context: MiddlewareContext,
// 	next: NextMetadataMiddleware
// ) => void;