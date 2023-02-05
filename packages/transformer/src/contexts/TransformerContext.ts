import * as ts               from "typescript";
import { Config }            from "../config/Config";
import { DependencyManager } from "../dependencies/DependencyManager";
import {
	log,
	LogColor,
	LogLevel
}                            from "../logging";
import { MetadataLibrary }   from "../metadata/MetadataLibrary";
import { MetadataManager }   from "../metadata/MetadataManager";
import { normalizePath }     from "../utils/normalizePath";
import { mainVisitor }       from "../visitors/mainVisitor";
import { Context }           from "./Context";

const perfProgramStart = performance.now(); // TODO: What will this do when transformer instantiated multiple time in one process?

export class TransformerContext
{
	/**
	 * @internal
	 */
	private readonly perfEntries: [initialization: number, persistance: number, ...sourceFiles: number[]] = [0, 0];

	/**
	 * Metadata manager use to work with metadata.
	 * @internal
	 */
	public readonly metadataManager: MetadataManager;

	/**
	 * SourceFile context set for each visiting SourceFile.
	 * @internal
	 */
	private sourceFileContext?: Context;

	/**
	 * List of root filenames.
	 * @internal
	 * @description Paths of all TS files matched by "include" (not in "exclude") from tsconfig.
	 * It is preferred to include only one root file and let other files be included by imports.
	 * Root files are transformer as last.
	 * If no include is defied in tsconfig, default rule is applied which are all files in directory.
	 */
	private readonly rootFileNames: ReadonlySet<string>;

	/**
	 * @internal
	 */
	private _numberOfVisitedRootFileNames = 0;

	/**
	 * TypeScript Program.
	 */
	public readonly program: ts.Program;

	/**
	 * Configuration object.
	 */
	public readonly config: Config;

	/**
	 * TypeScript type checker.
	 */
	public readonly typeChecker: ts.TypeChecker;

	/**
	 * Metadata library.
	 */
	public readonly metadata: MetadataLibrary;

	/**
	 * Manager of package dependencies.
	 */
	public readonly dependencyManager: DependencyManager;

	constructor(program: ts.Program, config: Config)
	{
		this.config = config;
		this.program = program;
		this.typeChecker = program.getTypeChecker();
		this.rootFileNames = new Set(program.getRootFileNames().map(normalizePath));

		this.dependencyManager = new DependencyManager(config);
		this.metadata = MetadataLibrary.init(this.dependencyManager);
		this.metadataManager = new MetadataManager(config, this.metadata, this.dependencyManager);

		// This will allow deconstruction of the context.
		this.visitSourceFile = this.visitSourceFile.bind(this);

		// Write INIT performance
		this.perfEntries[0] = performance.now() - perfProgramStart;
	}

	/**
	 * Visit SourceFile by given visitor.
	 * @description This method handle all the system stuff around contexts and metadata generation.
	 * @param sourceFileNode
	 * @param transformationContext
	 * @param visitor
	 */
	visitSourceFile(
		sourceFileNode: ts.SourceFile,
		transformationContext: ts.TransformationContext,
		visitor: (sourceFileNode: ts.SourceFile, sourceFileContext: Context) => ts.SourceFile
	): ts.SourceFile
	{
		const sourceFileStart = performance.now();

		// Create SourceFile context and register it.
		const sourceFileContext = this.sourceFileContext = new Context(
			undefined,
			this,
			transformationContext,
			sourceFileNode,
			mainVisitor
		);

		// Callback
		const visitedSourceFile = this.metadataManager.updateSourceFile(
			visitor(sourceFileNode, sourceFileContext)
		);

		this.perfEntries.push(performance.now() - sourceFileStart);

		// If given SourceFile is one of the root files.
		if (this.rootFileNames.has(sourceFileNode.fileName))
		{
			this._numberOfVisitedRootFileNames++;

			// If it is last root SourceFile.
			if (this._numberOfVisitedRootFileNames === this.rootFileNames.size)
			{
				const persistStart = performance.now();

				// Emit metadata
				this.metadataManager.emitMetadataLibrary();

				this.perfEntries[1] = performance.now() - persistStart;

				const total = this.perfEntries.reduce((sum, num) => sum + num, 0);
				log.log(
					sourceFileContext.config.devMode ? LogLevel.Dev : LogLevel.Debug,
					LogColor.magenta,
					"Completed!",
					"\n\tInitialization:",
					roundPerfTime(this.perfEntries[0]), "sec.",

					"\n\tType discovery and transformations:",
					roundPerfTime(total - this.perfEntries[0] - this.perfEntries[1]), "sec.",

					"\n\tSerialization and emitting of metadata:",
					roundPerfTime(this.perfEntries[1]), "sec.",

					"\n\tTotal time:",
					roundPerfTime(total), "sec.",

					"\n\tProcessed", this.metadata.getNumberOfTypes(), "type(s) from",
					this.metadata.getNumberOfModules(), "module(s).",
				);
			}
		}

		return visitedSourceFile;
	}
}

function roundPerfTime(time: number)
{
	return Math.round(time * 100) / 100000;
}