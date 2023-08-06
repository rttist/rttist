import * as fs from "fs";
import * as ts from "typescript";
import { Config } from "../../config/config";
import { DependencyManager } from "../../dependencies/dependency-manager";
import { Logger } from "../../logging";
import { LogBuffer } from "../../logging/log-buffer";
import { MetadataLibrary } from "../../metadata/metadata-library";
import { MetadataManager } from "../../metadata/metadata-manager";
import { MetadataPrinter } from "../../metadata/metadata-printer";
import { dirname } from "../../utils/path";
import { resolveSourceFileCachePath } from "../../utils/resolve-sourcefile-cache-path";
import { ModuleIdentifierGenerator } from "../syntax-type-checker/identifier-generators/module-identifier-generator";
import { TypeCheckerTypeIdentifierGenerator } from "../syntax-type-checker/identifier-generators/type-checker-type-identifier-generator";
import { TypeIdentifierGenerator } from "../syntax-type-checker/identifier-generators/type-identifier-generator";
import { ScopeAnalyzer } from "../syntax-type-checker/scope-analyzer";
import { ScopeManager } from "../syntax-type-checker/scopes/scope-manager";
import { ScopeRegistry } from "../syntax-type-checker/scopes/scope-registry";
import { SyntaxTypeChecker } from "../syntax-type-checker/type-checkers/syntax-type-checker";
import { TypeScriptTypeTypeChecker } from "../syntax-type-checker/type-checkers/typescript-type-type-checker";
import { mainVisitor } from "../visitors/main-visitor";
import { Context } from "./context";
import { SourceFileContext } from "./source-file-context";

const perfProgramStart = performance.now(); // TODO: What will this do when transformer instantiated multiple time in one process?

export class TransformerContext {
	/**
	 * @internal
	 */
	private readonly perfEntries = {
		persistence: 0,
		sourceFiles: [] as number[],
	};

	/**
	 * Metadata manager use to work with metadata.
	 * @internal
	 */
	public readonly metadataManager: MetadataManager;

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
	 * Syntax type checker.
	 */
	public readonly syntaxTypeChecker: SyntaxTypeChecker;

	/**
	 * Syntax type checker.
	 */
	public readonly tsTypeTypeChecker: TypeScriptTypeTypeChecker;

	/**
	 * Scope manager.
	 */
	public readonly scopeManager: ScopeManager;

	// TODO: implement
	public readonly writePromises: Promise<void>[] = [];

	private readonly metadataPrinter: MetadataPrinter;
	private readonly scopeRegistry: ScopeRegistry;
	private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator;
	private readonly scopeAnalyzer: ScopeAnalyzer;

	constructor(
		public readonly program: ts.Program,
		public readonly config: Config,
		private readonly writeFileCallback: (filename: string) => void
	) {
		this.typeChecker = program.getTypeChecker();
		this.dependencyManager = new DependencyManager(config);
		this.metadata = MetadataLibrary.init(this.dependencyManager);
		this.metadataManager = new MetadataManager(config, this.metadata, this.dependencyManager);
		this.metadataPrinter = new MetadataPrinter(config);

		this.scopeRegistry = new ScopeRegistry();
		this.moduleIdentifierGenerator = new ModuleIdentifierGenerator(config);
		this.scopeAnalyzer = new ScopeAnalyzer(config, this.scopeRegistry, this.moduleIdentifierGenerator);
		this.scopeManager = new ScopeManager(this.scopeAnalyzer, this.scopeRegistry);
		this.syntaxTypeChecker = new SyntaxTypeChecker(
			new TypeIdentifierGenerator(this.scopeManager),
			new Logger("SyntaxTypeChecker", undefined, LogBuffer.default)
		);
		this.tsTypeTypeChecker = new TypeScriptTypeTypeChecker(
			new TypeCheckerTypeIdentifierGenerator(
				this.scopeManager,
				this.moduleIdentifierGenerator,
				this.config,
				this.typeChecker,
				new Logger("TypeCheckerTypeIdentifierGenerator", undefined, LogBuffer.default)
			)
		);

		// This will allow deconstruction of the context.
		this.visitSourceFile = this.visitSourceFile.bind(this);
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
	): ts.SourceFile {
		const sourceFileStart = performance.now();

		const sourceFileContext = new SourceFileContext(
			sourceFileNode,
			this.config,
			this.scopeAnalyzer.analyzeSourceFile(sourceFileNode, transformationContext)
		);

		const context = new Context(
			undefined,
			this,
			transformationContext,
			sourceFileContext,
			sourceFileNode,
			mainVisitor
		);

		// Visit SourceFile
		visitor(sourceFileNode, context);

		this.perfEntries.sourceFiles.push(performance.now() - sourceFileStart);

		// const relativeFilePath = path.relative(this.config.projectRoot, sourceFileNode.fileName); // TODO: Should be probably relative to TS rootDir
		// const filePath = resolvePath(this.config.cacheDir, relativeFilePath);
		const filePath = resolveSourceFileCachePath(sourceFileNode.fileName, this.config);
		const fileMetadataDirname = dirname(filePath);

		// TODO: Make it async
		fs.mkdirSync(fileMetadataDirname, { recursive: true });
		fs.writeFileSync(filePath, this.metadataPrinter.printMetadata(sourceFileContext.metadata), "utf8");

		this.writeFileCallback(sourceFileNode.fileName);

		return sourceFileNode;
	}
}
