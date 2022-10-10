import * as ts               from "typescript";
import { Config }            from "../config/Config";
import { PACKAGE_ID }        from "../consts";
import { DependencyManager } from "../dependencies/DependencyManager";
import {
	log,
	LogColor,
	LogLevel
}                            from "../logging";
import { MetadataLibrary }   from "../metadata/MetadataLibrary";
import { MetadataManager }   from "../metadata/MetadataManager";
import { SourceFileContext } from "./SourceFileContext";

const InstanceKey: symbol = Symbol.for("tst-reflect.TransformerContext");
let instance: TransformerContext = (global as any)[InstanceKey] || undefined;

const perfProgramStart = performance.now();

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
	private readonly metadataManager: MetadataManager;

	/**
	 * SourceFile context set for each visiting SourceFile.
	 * @internal
	 */
	private sourceFileContext?: SourceFileContext;

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

	/**
	 * Get singleton instance of TransformerContext.
	 */
	static get instance(): TransformerContext
	{
		if (!instance)
		{
			throw new Error(PACKAGE_ID + ": TransformerContext has not been initiated yet!");
		}

		return instance;
	}

	/**
	 * Accessor to currently visiting SourceFile.
	 */
	get currentSourceFileContext(): SourceFileContext | undefined
	{
		return this.sourceFileContext;
	}

	/**
	 * Protected constructor.
	 * @protected
	 */
	protected constructor(program: ts.Program, config: Config)
	{
		if (new.target != Activator)
		{
			throw new Error("This constructor is protected.");
		}

		this.config = config;
		this.program = program;
		this.typeChecker = program.getTypeChecker();
		this.rootFileNames = new Set(program.getRootFileNames());

		this.dependencyManager = new DependencyManager(config);
		this.metadata = MetadataLibrary.init(this.dependencyManager);
		this.metadataManager = new MetadataManager(config, this.metadata, this.dependencyManager);

		// This will allow deconstruction of the context.
		this.visitSourceFile = this.visitSourceFile.bind(this);
	}

	/**
	 * Init context.
	 * @param program
	 * @param config
	 */
	static init(program: ts.Program, config: Config)
	{
		if (instance !== undefined)
		{
			throw new Error("TransformerContext.init called twice!");
		}

		instance = Reflect.construct(TransformerContext, [
			program,
			config
		], Activator);

		log.log(LogLevel.Info, LogColor.blue, "Detected project root: " + config.projectDir);

		// Write INIT performance
		instance.perfEntries[0] = performance.now() - perfProgramStart;
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
		visitor: (sourceFileNode: ts.SourceFile, sourceFileContext: SourceFileContext) => ts.SourceFile
	): ts.SourceFile
	{
		const sourceFileStart = performance.now();

		// Create SourceFile context and register it.
		const sourceFileContext = this.sourceFileContext = new SourceFileContext(
			sourceFileNode,
			this,
			transformationContext
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
				log.debug(
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

class Activator extends TransformerContext
{
}

function roundPerfTime(time: number)
{
	return Math.round(time * 100) / 100000;
}