import * as ts from "typescript";
import type { Config } from "../config/config";
import { DependencyManager } from "../dependencies/dependency-manager";
import { MetadataLibrary } from "./metadata-library";

export class MetadataManager {
	// public readonly libraryFileEmitter: MetadataFilesEmitter;
	// private readonly sourceFileMetadataUpdater: SourceFileMetadataUpdater;

	constructor(
		private readonly config: Config,
		private readonly metadataLibrary: MetadataLibrary,
		dependencyManager: DependencyManager
	) {
		// this.libraryFileEmitter = new MetadataFilesEmitter(config, dependencyManager, metadataLibrary);
		// this.sourceFileMetadataUpdater = new SourceFileMetadataUpdater(config);
	}

	updateSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
		// return this.sourceFileMetadataUpdater.addMetadataToSourceFileIfRequired(sourceFile);
		return sourceFile;
	}

	emitMetadataLibrary() {
		// const modules = Array.from(this.metadataLibrary.getModules())
		// 	.map(moduleMetadata => moduleMetadata.getModuleProperties(this.config));
		// const source: MetadataSource = { modules };
		//
		// try
		// {
		// 	this.libraryFileEmitter.emit(source);
		//
		// 	log.log(
		// 		LogLevel.Trace,
		// 		LogColor.blue,
		// 		`Typelib file generated: '${
		// 			this.config.emit === EmitType.TypeScript
		// 				? this.config.metadataTypelibSourcePath
		// 				: this.config.metadataTypelibPath
		// 		}'`
		// 	);
		// }
		// catch (error)
		// {
		// 	log.error(error);
		// }
	}
}
