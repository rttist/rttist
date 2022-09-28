import type { Config }      from "../config/Config";
import * as ts              from "typescript";
import path                 from "path";
import { updateSourceFile } from "../transformers/updateSourceFile";

export class SourceFileMetadataUpdater
{
	constructor(
		private readonly config: Config
	)
	{
	}

	addMetadataToSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	{
		// TODO: This solves nothing. TypeProperties are still the same. We don't have reference to the type.
		//  We should add identifier to the properties and use it here and remove in typelib.

		// TODO: Solve differently. This iterate over all modules from whole Program; those already processed.
		// const modules = Array.from(this.transformerContext.metadata.getModules()).map(moduleMetadata => moduleMetadata.getModuleProperties());
		//
		// for (const module of modules)
		// {
		// 	const typesInFile: TransformerTypeReference[] = this.transformerContext.metadata.getInFileTypes(sourceFile);
		//
		// 	module.types = module.types?.filter(type =>
		// 			// Only not exported types
		// 			type.exported === undefined
		// 			// found in given SourceFile
		// 			&& typesInFile.some(typeInFileReference =>
		// 				type.id === typeInFileReference
		// 				|| (type.id === undefined && typeof typeInFileReference !== "string" && type.kind === typeInFileReference.kind)
		// 			)
		// 	);
		// }

		// const source: MetadataSource = { modules };
		// const metadata: MiddlewareResult = processMiddlewares(this.transformerContext, source);
		// const expression = createValueExpression(metadata);

		return updateSourceFile(
			sourceFile,
			[
				ts.factory.createImportDeclaration(
					undefined,
					undefined,
					ts.factory.createStringLiteral(path.relative(
						path.dirname(sourceFile.fileName),
						this.config.metadataTypelibVirtualPath
					))
				)
				// ts.factory.createExpressionStatement(expression)
			]
		);
	}
}