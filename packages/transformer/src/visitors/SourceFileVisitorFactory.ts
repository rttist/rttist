import * as ts                  from "typescript";
import { TransformerContext }   from "../contexts/TransformerContext";
import {
	color,
	log,
	LogLevel
}                               from "../log";
import { canIncludeSourceFile } from "../utils/canIncludeSourceFile";

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

		return sourceFileNode =>
		{
			
			if (
				// It should always be a SourceFile, but check it, just for case.
				!ts.isSourceFile(sourceFileNode)
				|| !canIncludeSourceFile(sourceFileNode, config)
			)
			{
				return sourceFileNode;
			}

			const visitedSourceFileNode = transformerContext.visitSourceFile(sourceFileNode, transformationContext, sourceFileContext => {
				if (config.debugMode)
				{
					log.log(LogLevel.Trace, color.cyan, `Visitation of file ${sourceFileNode.fileName} started.`);
				}

				// // Create Context for the SourceFile
				// const sourceFileContext = new SourceFileContext(sourceFileNode, transformerContext, transformationContext);
				//
				// // Set Current SourceFileContext into the TransformerContext
				// transformerContext.setSourceFileContext(sourceFileContext);
				//

				// Visit SourceFile
				let visitedSourceFileNode = sourceFileContext.visit();

				// PLUGINS
				for (let plugin of config.plugins)
				{
					plugin.visit(visitedSourceFileNode, sourceFileContext);
				}

				if (config.debugMode)
				{
					log.trace(`Visitation of file ${sourceFileNode.fileName} has been finished.`);
				}

				return visitedSourceFileNode;
			});

			return visitedSourceFileNode;
		};
	}
}