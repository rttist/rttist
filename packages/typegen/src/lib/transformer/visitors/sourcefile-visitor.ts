import * as ts from "typescript";
import { Context } from "../contexts/context";
import { TransformerContext } from "../contexts/transformer-context";

/**
 * Factory of SourceFile visitor.
 */
export function createSourceFileVisitor(
	transformationContext: ts.TransformationContext,
	transformerContext: TransformerContext
) {
	const { program, config, visitSourceFile } = transformerContext;

	return function handleSourceFile(sourceFileNode: ts.SourceFile): ts.SourceFile {
		// // It should always be a SourceFile, but check it, just for case.
		// if (!ts.isSourceFile(sourceFileNode)) {
		// 	return sourceFileNode;
		// }

		// // Skip if it is external SourceFile or if file is not included by config.
		// if (
		// 	program.isSourceFileFromExternalLibrary(sourceFileNode) ||
		// 	!canIncludeSourceFile(sourceFileNode.fileName, config)
		// ) {
		// 	return sourceFileNode;
		// }

		visitSourceFile(sourceFileNode, transformationContext, sourceFileVisitor);

		return sourceFileNode;
	};

	function sourceFileVisitor(sourceFileNode: ts.SourceFile, sourceFileContext: Context) {
		if (config.devMode) {
			// TODO: Uncomment
			// log.log(LogLevel.Info, LogColor.cyan, `Visitation of file ${sourceFileNode.fileName} started.`);
		}

		// Visit SourceFile
		sourceFileContext.visitWithCurrentContext(sourceFileNode);

		// // PLUGINS
		// for (let plugin of config.plugins)
		// {
		// 	if (plugin.visit !== undefined)
		// 	{
		// 		visitedSourceFileNode = plugin.visit(visitedSourceFileNode, sourceFileContext);
		// 	}
		// }

		// TODO: Uncomment
		// if (config.devMode)
		// {
		// 	log.log(LogLevel.Info, LogColor.gray, `Visitation of file ${sourceFileNode.fileName} has been finished.`);
		// }

		return sourceFileNode;
	}
}
