import * as ts                   from "typescript";
import { MetadataTypeValues }    from "../config-options";
import { SourceFileContext }     from "../contexts/SourceFileContext";
import { TransformerContext }    from "../contexts/TransformerContext";
import { MetadataSource }        from "../declarations/TypeProperties";
import { PACKAGE_ID }            from "../helpers";
import { MiddlewareResult }      from "../middlewares";
import { processMiddlewares }    from "../middlewares/processMiddlewares";
import {
	color,
	log,
	LogLevel
}                                from "../log";
import { createValueExpression } from "../utils/createValueExpression";

/**
 * Factory of SourceFile visitor.
 */
export class SourceFileVisitorFactory
{
	/**
	 * @param transformationContext
	 */
	constructor(private readonly transformationContext: ts.TransformationContext)
	{
	}

	create(): ts.Visitor
	{
		const transformerContext = TransformerContext.instance;
		const transformationContext = this.transformationContext;
		const config = transformerContext.config;
		
		// program.isSourceFileFromExternalLibrary()
		// program.isSourceFileDefaultLibrary();
		// program.getRootFileNames()
		const sourceFileCount = transformerContext.program.getSourceFiles().length;
		let processedSourceFiles = 0;

		return sourceFileNode =>
		{
			// It should always be a SourceFile, but check it, just for case.
			if (!ts.isSourceFile(sourceFileNode))
			{
				return sourceFileNode;
			}

			if (config.debugMode)
			{
				log.log(LogLevel.Trace, color.cyan, `${PACKAGE_ID}: Visitation of file ${sourceFileNode.fileName} started.`);
			}

			// Create Context for the SourceFile
			const sourceFileContext = new SourceFileContext(sourceFileNode, transformerContext, transformationContext);

			// Set Current SourceFileContext into the TransformerContext
			transformerContext.setSourceFileContext(sourceFileContext);

			// Visit node
			let visitedSourceFileNode = sourceFileContext.context.visit(sourceFileNode) as ts.SourceFile;

			// PLUGINS
			for (let plugin of config.plugins)
			{
				plugin.visit(sourceFileNode, sourceFileContext);
			}

			if (config.debugMode)
			{
				log.trace(`${PACKAGE_ID}: Visitation of file ${sourceFileNode.fileName} has been finished.`);
			}

			// Increase SourceFile counter
			processedSourceFiles++;
			
			if (processedSourceFiles === sourceFileCount) 
			{
				log.debug("Last file visited!");

				// TODO: This must be fixed! SourceFileContext.metadata.getModules() returns all the modules again and again for each sourcefile, sourceFileContext.metadata is static singleton.
				const modules = Array.from(sourceFileContext.metadata.getModules()).map(moduleMetadata => moduleMetadata.getModuleProperties());

				// // Filter 
				// if (config.metadataType == MetadataTypeValues.inline)
				// {
				// 	for (const module of modules) {
				// 		const typesInFile: TransformerTypeReference[] = sourceFileContext.metadata.getInFileTypes(sourceFileContext.sourceFile);
				// 		module.types = module.types?.filter(type => typesInFile.some(typeInFileReference => type.id == typeInFileReference || (type.id == undefined && type.kind == typeInFileReference)));
				// 	}
				// }

				const source: MetadataSource = { modules };
				const metadata: MiddlewareResult = processMiddlewares(sourceFileContext, source);

				if (metadata)
				{
					const metadataExpression = createValueExpression(metadata);

					// TYPELIB - add import of metadata library
					if (config.metadataType == MetadataTypeValues.typeLib)
					{
						log.debug("Generating metadata file.");
						
						// 		const propertiesStatements: Array<[number, ts.ObjectLiteralExpression]> = [];
						// 		const typeIdUniqueObj: { [key: number]: boolean } = {};
						//
						// 		for (let [typeId, properties] of sourceFileContext.typesMetadata)
						// 		{
						// 			if (typeIdUniqueObj[typeId])
						// 			{
						// 				continue;
						// 			}
						//
						// 			typeIdUniqueObj[typeId] = true;
						// 			propertiesStatements.push([typeId, properties]);
						// 		}
						//
						// 		const typeCtor = new Set<ts.PropertyAccessExpression>();
						// 		for (let ctor of sourceFileContext.typesCtors)
						// 		{
						// 			typeCtor.add(ctor);
						// 		}
						//
						transformerContext.metadata.writer.writeModule(metadataExpression);//writeMetaProperties(propertiesStatements, typeCtor, transformationContext);
					}
					else if (config.metadataType == MetadataTypeValues.inline)
					{
						console.warn("Mode 'inline' is not implemented yet.");

						//const types = sourceFileContext.metadata.getInFileTypes(sourceFileContext.sourceFile);

						// for (let moduleMetadata of modules)
						// {
						// 	statements.push(ts.factory.createExpressionStatement(
						// 		sourceFileContext.metaWriter.factory.addDescriptionToStore(typeId, properties)
						// 	));
						// }
					}
				}
			}

			return visitedSourceFileNode;
		};
	}
}