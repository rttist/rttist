import * as ts                       from "typescript";
import type { Config }               from "../config/Config";
import type { MetadataSource }       from "../declarations/TypeProperties";
import type { DependencyManager }    from "../dependencies/DependencyManager";
import type { MiddlewareResult }     from "../middlewares";
import type { MetadataLibrary }      from "./MetadataLibrary";
import { processMiddlewares }        from "../middlewares/processMiddlewares";
import { createValueExpression }     from "../utils/createValueExpression";
import { LibraryFileEmitter }        from "./LibraryFileEmitter";
import { SourceFileMetadataUpdater } from "./SourceFileMetadataUpdater";
import {
	LogColor,
	log,
	LogLevel
}                                    from "../logging";

export class MetadataManager
{
	private readonly libraryFileEmitter: LibraryFileEmitter;
	private readonly sourceFileMetadataUpdater: SourceFileMetadataUpdater;

	constructor(
		private readonly config: Config,
		private readonly metadataLibrary: MetadataLibrary,
		dependencyManager: DependencyManager
	)
	{
		this.libraryFileEmitter = new LibraryFileEmitter(config, dependencyManager, metadataLibrary);
		this.sourceFileMetadataUpdater = new SourceFileMetadataUpdater(config);
	}

	updateSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	{
		return this.sourceFileMetadataUpdater.addMetadataToSourceFile(sourceFile);
	}

	emitMetadataLibrary()
	{
		const modules = Array.from(this.metadataLibrary.getModules())
			.map(moduleMetadata => moduleMetadata.getModuleProperties());
		const source: MetadataSource = { modules };
		const metadata: MiddlewareResult = processMiddlewares(source);

		this.libraryFileEmitter.emit(createValueExpression(metadata))
			.then(() => {
				log.log(
					LogLevel.Trace,
					LogColor.cyan,
					`Typelib file generated: '${this.config.metadataTypelibPath}'`
				);
			})
			.catch(error => {
				log.error(error);
			});
	}
}