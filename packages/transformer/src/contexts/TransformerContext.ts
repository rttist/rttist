import * as ts               from "typescript";
import {
	ConfigObject,
	createConfig
}                            from "../config";
import { MetadataLibrary }   from "../metadata/MetadataLibrary";
import { MetadataManager }   from "../metadata/MetadataManager";
import { SourceFileContext } from "./SourceFileContext";

const InstanceKey: symbol = Symbol.for("tst-reflect.TransformerContext");
let instance: TransformerContext = (global as any)[InstanceKey] || undefined;

export class TransformerContext
{
	// private _metaWriter?: IMetadataWriter;

	/**
	 * Metadata manager use to work with metadata.
	 * @private
	 */
	private readonly metadataManager: MetadataManager;

	/**
	 * SourceFile context set for each visiting SourceFile.
	 * @private
	 */
	private sourceFileContext?: SourceFileContext;

	/**
	 * TypeScript Program.
	 */
	public program: ts.Program;

	/**
	 * Configuration object.
	 */
	public config: ConfigObject;

	/**
	 * TypeScript CompilerOptions.
	 */
	public tsConfig: ts.CompilerOptions;

	/**
	 * TypeScript type checker.
	 */
	public readonly checker: ts.TypeChecker;

	/**
	 * Metadata library.
	 */
	public readonly metadata: MetadataLibrary;

	/**
	 * List of root filenames.
	 * @description Paths of all TS files matched by "include" (not in "exclude") from tsconfig.
	 * It is preferred to include only one root file and let other files be included by imports.
	 * Root files are transformer as last.
	 * If no include is defied in tsconfig, default rule is applied which are all files in directory.
	 */
	public readonly rootFileNames: ReadonlySet<string>;

	private _numberOfVisitedRootFileNames = 0;

	/**
	 * Get singleton instance of TransformerContext.
	 */
	static get instance(): TransformerContext
	{
		if (!instance)
		{
			throw new Error("tst-reflect: TransformerContext hasn't been initiated yet!");
		}

		return instance;
	}

	/**
	 * SourceFile context set for each visiting SourceFile.
	 */
	get currentSourceFileContext(): SourceFileContext | undefined
	{
		return this.sourceFileContext;
	}

	// /**
	//  * Get the metadata library writer handler
	//  *
	//  * @returns {IMetadataWriter}
	//  */
	// get metaWriter(): IMetadataWriter
	// {
	// 	if (!this._metaWriter)
	// 	{
	// 		throw new Error("TransformerContext has not been initiated yet.");
	// 	}
	//
	// 	return this._metaWriter;
	// }

	/**
	 * Protected constructor.
	 * @protected
	 */
	protected constructor(program: ts.Program, config: ConfigObject)
	{
		if (new.target != Activator)
		{
			throw new Error("This constructor is protected.");
		}

		this.program = program;
		this.config = config;
		this.tsConfig = config.parsedCommandLine.options;
		this.checker = program.getTypeChecker();

		this.rootFileNames = new Set(program.getRootFileNames());

		this.metadataManager = new MetadataManager(this);
		this.metadata = MetadataLibrary.init(this);
	}

	/**
	 * Init context.
	 * @param program
	 */
	static init(program: ts.Program)
	{
		if (instance !== undefined)
		{
			throw new Error("TransformerContext.init called twice!");
		}

		const config = createConfig(program);

		instance = Reflect.construct(TransformerContext, [
			program,
			config
		], Activator);
	}

	/**
	 * @internal
	 * @param context
	 */
	private setSourceFileContext(context: SourceFileContext)
	{
		this.sourceFileContext = context;
	}

	visitSourceFile(
		sourceFileNode: ts.SourceFile,
		transformationContext: ts.TransformationContext,
		callback: (sourceFileContext: SourceFileContext) => ts.SourceFile
	): ts.SourceFile
	{
		// Create SourceFile context and register it.
		const sourceFileContext = new SourceFileContext(sourceFileNode, this, transformationContext);
		this.setSourceFileContext(sourceFileContext);

		// Callback
		const visitedSourceFile = callback(sourceFileContext);

		// If given SourceFile is one of the root files.
		if (this.rootFileNames.has(sourceFileNode.fileName))
		{
			this._numberOfVisitedRootFileNames++;

			// If it is last root SourceFile.
			if (this._numberOfVisitedRootFileNames == this.rootFileNames.size)
			{
				this.metadataManager.emitMetadataLibrary();
			}
		}

		return visitedSourceFile;
	}
}

class Activator extends TransformerContext
{
}
