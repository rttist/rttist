import * as ts                  from "typescript";
import { SourceFileContext }    from "../contexts/SourceFileContext";
import { TransformerContext }   from "../contexts/TransformerContext";
import {
	LogColor,
	LogLevel,
	log
}                               from "../logging";
import { canIncludeSourceFile } from "../utils/canIncludeSourceFile";

/**
 * Factory of SourceFile visitor.
 */
export function createSourceFileVisitor(transformationContext: ts.TransformationContext)
{
	const { program, config, visitSourceFile } = TransformerContext.instance;

	return function handleSourceFile(sourceFileNode: ts.SourceFile): ts.SourceFile
	{
		// It should always be a SourceFile, but check it, just for case.
		if (!ts.isSourceFile(sourceFileNode))
		{
			return sourceFileNode;
		}

		// Skip if it is external SourceFile or if file is not included by config.
		if (program.isSourceFileFromExternalLibrary(sourceFileNode) || !canIncludeSourceFile(sourceFileNode, config))
		{
			return sourceFileNode;
		}

		return visitSourceFile(sourceFileNode, transformationContext, sourceFileVisitor);
	};

	function sourceFileVisitor(sourceFileNode: ts.SourceFile, sourceFileContext: SourceFileContext)
	{
		if (config.devMode)
		{
			log.log(LogLevel.Info, LogColor.cyan, `Visitation of file ${sourceFileNode.fileName} started.`);
		}

		// Visit SourceFile
		let visitedSourceFileNode = sourceFileContext.visit();

		// PLUGINS
		for (let plugin of config.plugins)
		{
			if (plugin.visit !== undefined)
			{
				visitedSourceFileNode = plugin.visit(visitedSourceFileNode, sourceFileContext);
			}
		}

		if (config.devMode)
		{
			log.log(LogLevel.Info, LogColor.gray, `Visitation of file ${sourceFileNode.fileName} has been finished.`);
		}

		return visitedSourceFileNode;
	}
}