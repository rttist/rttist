// import * as ts                      from "typescript";
// import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
// import { toExpression }             from "../utils/toExpression";
//
// export class MetadataNodeFactory
// {
// 	constructor()
// 	{
// 	}
//
// 	/**
// 	 * Create expression resolving type in runtime.
// 	 * @param reference
// 	 */
// 	createTypeResolver(reference: TransformerTypeReference): ts.Expression
// 	{
// 		// NOTE: We can create Metadata for local file only
// 		// and in case of local-only type we should resolveType from local Metadata.
//
// 		return ts.factory.createCallExpression(
// 			ts.factory.createPropertyAccessExpression(
// 				ts.factory.createIdentifier("__RTTIST$"), // TODO: Put this identifier name to const
// 				ts.factory.createIdentifier("resolveType")
// 			),
// 			undefined,
// 			[
// 				toExpression(reference)
// 			]
// 		);
// 	}
// }