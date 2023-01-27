import * as ts                       from "typescript";
import type { Config }               from "../config/Config";
import type { MetadataSource }       from "../declarations/TypeProperties";
import type { DependencyManager }    from "../dependencies/DependencyManager";
import type { MetadataLibrary }      from "./MetadataLibrary";
import { MetadataFilesEmitter }      from "./MetadataFilesEmitter";
import { SourceFileMetadataUpdater } from "./SourceFileMetadataUpdater";
import {
	LogColor,
	log,
	LogLevel
}                                    from "../logging";

export class MetadataManager
{
	public readonly libraryFileEmitter: MetadataFilesEmitter;
	private readonly sourceFileMetadataUpdater: SourceFileMetadataUpdater;

	constructor(
		private readonly config: Config,
		private readonly metadataLibrary: MetadataLibrary,
		dependencyManager: DependencyManager
	)
	{
		this.libraryFileEmitter = new MetadataFilesEmitter(config, dependencyManager, metadataLibrary);
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

		this.libraryFileEmitter.emit(source)
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