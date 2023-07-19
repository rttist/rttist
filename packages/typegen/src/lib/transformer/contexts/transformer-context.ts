import * as fs from "fs";
import * as ts from "typescript";
import { Config } from "../../config/config";
import { DependencyManager } from "../../dependencies/dependency-manager";
import { MetadataLibrary } from "../../metadata/metadata-library";
import { MetadataManager } from "../../metadata/metadata-manager";
import { dirname } from "../../utils/path";
import { resolveSourceFileCachePath } from "../../utils/resolve-sourcefile-cache-path";
import { generateSourceFileModuleId } from "../id-generators";
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

	constructor(
		public readonly program: ts.Program,
		public readonly config: Config,
		private readonly writeFileCallback: (filename: string) => void
	) {
		this.typeChecker = program.getTypeChecker();
		this.dependencyManager = new DependencyManager(config);
		this.metadata = MetadataLibrary.init(this.dependencyManager);
		this.metadataManager = new MetadataManager(config, this.metadata, this.dependencyManager);

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

		const sourceFileContext = new SourceFileContext(sourceFileNode, this.config, transformationContext);
		sourceFileContext.analyzeScopes();

		// // Create SourceFile context and register it.
		// const sourceFileContext = (this.sourceFileContext = new Context(
		// 	undefined,
		// 	this,
		// 	transformationContext,
		// 	sourceFileNode,
		// 	mainVisitor
		// ));
		// Create SourceFile context and register it.
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

		fs.mkdirSync(fileMetadataDirname, { recursive: true });
		fs.writeFileSync(
			filePath,
			`import { MetadataLibrary } from "rttist";
export function add(library: MetadataLibrary, stripInternals: boolean = false) {
	library.addMetadata(${JSON.stringify(sourceFileContext.metadata.getModuleProperties(this.config))}, stripInternals);
}`,
			"utf8"
		);

		this.writeFileCallback(sourceFileNode.fileName);

		return sourceFileNode;
	}
}
