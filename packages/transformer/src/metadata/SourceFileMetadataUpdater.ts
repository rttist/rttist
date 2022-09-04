import * as ts                      from "typescript";
import { TransformerContext }       from "../contexts/TransformerContext";
import { TransformerTypeReference } from "../declarations/general";
import { MetadataSource }           from "../declarations/TypeProperties";
import { MiddlewareResult }         from "../middlewares";
import { processMiddlewares }       from "../middlewares/processMiddlewares";
import { updateSourceFile }         from "../transformers/updateSourceFile";
import { createValueExpression }    from "../utils/createValueExpression";

export class SourceFileMetadataUpdater
{
	private readonly transformerContext: TransformerContext;

	constructor(transformerContext: TransformerContext)
	{
		this.transformerContext = transformerContext;
	}

	addMetadataToSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	{
		return sourceFile;
		// TODO: This solves nothing. TypeProperties are still the same. We don't have reference to the type.
		//  We should add identifier to the properties and use it here and remove in typelib.
		
		// TODO: Solve differently. This iterate over all modules from whole Program; those already processed.
		const modules = Array.from(this.transformerContext.metadata.getModules()).map(moduleMetadata => moduleMetadata.getModuleProperties());

		for (const module of modules)
		{
			const typesInFile: TransformerTypeReference[] = this.transformerContext.metadata.getInFileTypes(sourceFile);

			module.types = module.types?.filter(type =>
					// Only not exported types
					type.exported === undefined
					// found in given SourceFile
					&& typesInFile.some(typeInFileReference =>
						type.id == typeInFileReference
						|| (type.id == undefined && typeof typeInFileReference !== "string" && type.kind == typeInFileReference.kind)
					)
			);
		}

		const source: MetadataSource = { modules };
		const metadata: MiddlewareResult = processMiddlewares(this.transformerContext, source);
		const expression = createValueExpression(metadata);

		return updateSourceFile(
			sourceFile,
			[
				ts.factory.createExpressionStatement(expression)
			]
		);
	}
}