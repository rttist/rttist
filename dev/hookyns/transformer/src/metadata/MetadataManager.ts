import * as ts                       from "typescript";
import type { Config }               from "../config/Config";
import { EmitType }                  from "../declarations/EmitType";
import type { MetadataSource }       from "../declarations/TypeProperties";
import type { DependencyManager }    from "../dependencies/DependencyManager";
import {
	log,
	LogColor,
	LogLevel
}                                    from "../logging";
import { MetadataFilesEmitter }      from "./MetadataFilesEmitter";
import type { MetadataLibrary }      from "./MetadataLibrary";
import { SourceFileMetadataUpdater } from "./SourceFileMetadataUpdater";

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
		return this.sourceFileMetadataUpdater.addMetadataToSourceFileIfRequired(sourceFile);
	}

	emitMetadataLibrary()
	{
		const modules = Array.from(this.metadataLibrary.getModules())
			.map(moduleMetadata => moduleMetadata.getModuleProperties(this.config));
		const source: MetadataSource = { modules };

		try
		{
			this.libraryFileEmitter.emit(source);

			log.log(
				LogLevel.Trace,
				LogColor.blue,
				`Typelib file generated: '${
					this.config.emit === EmitType.TypeScript
						? this.config.metadataTypelibSourcePath
						: this.config.metadataTypelibPath
				}'`
			);
		}
		catch (error)
		{
			log.error(error);
		}
	}
}