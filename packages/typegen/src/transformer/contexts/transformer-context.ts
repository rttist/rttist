import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { Config } from "../../config/config";
import { dirname, normalizePath, relativePath, resolvePath } from "../../utils/path";
import { resolveSourceFileCachePath } from "../../utils/resolve-sourcefile-cache-path";
import { DependencyManager } from "../dependencies/dependency-manager";
import { getSourceFileId } from "../getSourceFileId";
import { MetadataLibrary } from "../metadata/metadata-library";
import { MetadataManager } from "../metadata/metadata-manager";
import { getRelativePath } from "../utils/getRelativePath";
// import { DependencyManager } from "../dependencies/DependencyManager";
// import { MetadataLibrary } from "../metadata/MetadataLibrary";
// import { MetadataManager } from "../metadata/MetadataManager";
import { mainVisitor } from "../visitors/main-visitor";
import { Context } from "./context";

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
	 * SourceFile context set for each visiting SourceFile.
	 * @internal
	 */
	private sourceFileContext?: Context;

	// /**
	//  * List of root filenames.
	//  * @internal
	//  * @description Paths of all TS files matched by "include" (not in "exclude") from tsconfig.
	//  * It is preferred to include only one root file and let other files be included by imports.
	//  * Root files are transformer as last.
	//  * If no include is defied in tsconfig, default rule is applied which are all files in directory.
	//  */
	// private readonly rootFileNames: ReadonlySet<string>;
	//
	// /**
	//  * @internal
	//  */
	// private _numberOfVisitedRootFileNames = 0;

	// /**
	//  * TypeScript Program.
	//  */
	// public readonly program: ts.Program;
	//
	// /**
	//  * Configuration object.
	//  */
	// public readonly config: Config;

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
		// this.config = config;
		// this.program = program;
		this.typeChecker = program.getTypeChecker();

		// const rootFilenames = program.getRootFileNames()
		// 	.map(normalizePath)
		// 	.filter(fn => !fn.endsWith(".d.ts"));
		//
		// this.rootFileNames = new Set(rootFilenames);

		this.dependencyManager = new DependencyManager(config);
		this.metadata = MetadataLibrary.init(this.dependencyManager);
		this.metadataManager = new MetadataManager(config, this.metadata, this.dependencyManager);

		// if (config.devMode) {
		// 	log.debug("Root filenames:", ...rootFilenames.map(fn => "\n\t- " + fn));
		// }

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

		// Create SourceFile context and register it.
		const sourceFileContext = (this.sourceFileContext = new Context(
			undefined,
			this,
			transformationContext,
			sourceFileNode,
			mainVisitor
		));

		// Visit SourceFile
		visitor(sourceFileNode, sourceFileContext);

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
	library.addMetadata({
		id: "${getSourceFileId(sourceFileNode, this)}",
		name: "${sourceFileNode.moduleName ?? "undefined"}",
		path: "",
		import: () => import("${normalizePath(relativePath(fileMetadataDirname, sourceFileNode.fileName))}"),
		types: [],
	}, stripInternals);
}`,
			"utf8"
		);

		this.writeFileCallback(sourceFileNode.fileName);

		return sourceFileNode;
	}
}
