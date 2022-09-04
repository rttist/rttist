import type { TransformerContext }   from "../contexts/TransformerContext";
import type { MetadataSource }       from "../declarations/TypeProperties";
import { PACKAGE_ID }                from "../helpers";
import type { MiddlewareResult }     from "../middlewares";
import { processMiddlewares }        from "../middlewares/processMiddlewares";
import { createValueExpression }     from "../utils/createValueExpression";
import { LibraryFileEmitter }        from "./LibraryFileEmitter";
import * as ts                       from "typescript";
import { SourceFileMetadataUpdater } from "./SourceFileMetadataUpdater";
import {
	color,
	log,
	LogLevel
}                                    from "../log";

export class MetadataManager
{
	private readonly transformerContext: TransformerContext;
	private readonly libraryFileEmitter: LibraryFileEmitter;
	private readonly sourceFileMetadataUpdater: SourceFileMetadataUpdater;

	constructor(transformerContext: TransformerContext)
	{
		this.transformerContext = transformerContext;
		this.libraryFileEmitter = new LibraryFileEmitter(transformerContext);
		this.sourceFileMetadataUpdater = new SourceFileMetadataUpdater(transformerContext);
	}

	updateSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	{
		return this.sourceFileMetadataUpdater.addMetadataToSourceFile(sourceFile);
	}

	emitMetadataLibrary()
	{
		const modules = Array.from(this.transformerContext.metadata.getModules()).map(moduleMetadata => moduleMetadata.getModuleProperties());
		const source: MetadataSource = { modules };
		const metadata: MiddlewareResult = processMiddlewares(this.transformerContext, source);

		this.libraryFileEmitter.emit(createValueExpression(metadata))
			.then(() => {
				// if (this.transformerContext.config.debugMode)
				// {
					log.log(LogLevel.Trace, color.cyan, `${PACKAGE_ID}: Typelib file generated: '${this.libraryFileEmitter.getLibraryOutputFilePath()}'`);
				// }
			})
			.catch(error => {
				log.error(error);
			});
	}
}