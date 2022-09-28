import * as ts                      from "typescript";
import { TransformerTypeReference } from "../declarations/transformerTypeReference";
import { createValueExpression }    from "../utils/createValueExpression";

export class MetadataNodeFactory
{
	constructor()
	{
	}

	/**
	 * Create expression resolving type in runtime.
	 * @param reference
	 */
	createTypeResolver(reference: TransformerTypeReference): ts.Expression
	{
		return ts.factory.createCallExpression(
			ts.factory.createPropertyAccessExpression(
				ts.factory.createPropertyAccessExpression(
					ts.factory.createIdentifier("Reflect"),
					ts.factory.createIdentifier("Metadata")
				),
				ts.factory.createIdentifier("resolveType")
			),
			undefined,
			[
				createValueExpression(reference)
			]
		);
	}

	// /**
	//  * Generate import of the metadata type library.
	//  * @param sourceFile SourceFile required to generate correct relative path.
	//  */
	// createTypeLibImport(sourceFile: ts.SourceFile): ts.Statement
	// {
	// 	const path = this.metadata.writer.getRequireRelativePath(this.context.currentSourceFileContext?.context!, sourceFile.fileName);
	//	
	// 	if (this.context.config.esmModule) {
	// 		return ts.factory.createImportDeclaration(
	// 			undefined,
	// 			undefined,
	// 			ts.factory.createImportClause(
	// 				false, 
	// 				undefined,
	// 				undefined
	// 			),
	// 			ts.factory.createStringLiteral(path)
	// 		);
	// 	}
	// 	else {
	// 		return ts.factory.createExpressionStatement(
	// 			ts.factory.createCallExpression(
	// 				ts.factory.createIdentifier("require"),
	// 				undefined,
	// 				[ts.factory.createStringLiteral(path)]
	// 			)
	// 		);
	// 		// ts.factory.createVariableStatement(
	// 		// 	undefined,
	// 		// 	ts.factory.createVariableDeclarationList(
	// 		// 		[ts.factory.createVariableDeclaration(
	// 		// 			reflectionMetaIdentifier,
	// 		// 			// factory.createIdentifier("___tst_reflection_meta"),
	// 		// 			undefined,
	// 		// 			undefined,
	// 		// 			ts.factory.createCallExpression(
	// 		// 				ts.factory.createIdentifier("require"),
	// 		// 				undefined,
	// 		// 				[ts.factory.createStringLiteral(metaLibImportPath)]
	// 		// 			)
	// 		// 		)],
	// 		// 		ts.NodeFlags.Const
	// 		// 	)
	// 		// )
	// 	}
	// }
}