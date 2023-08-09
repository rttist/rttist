import * as ts from "typescript";
import { Config } from "../../config/config";
import { DependencyManager } from "../../dependencies/dependency-manager";
import { Logger } from "../../logging";
import { LogBuffer } from "../../logging/log-buffer";
import { MetadataLibrary } from "../../metadata/metadata-library";
import { MetadataManager } from "../../metadata/metadata-manager";
import { ModuleIdentifierGenerator } from "../syntax-type-checker/identifier-generators/module-identifier-generator";
import { TypeCheckerTypeIdentifierGenerator } from "../syntax-type-checker/identifier-generators/type-checker-type-identifier-generator";
import { TypeIdentifierGenerator } from "../syntax-type-checker/identifier-generators/type-identifier-generator";
import { ScopeAnalyzer } from "../syntax-type-checker/scope-analyzer";
import { ScopeManager } from "../syntax-type-checker/scopes/scope-manager";
import { ScopeRegistry } from "../syntax-type-checker/scopes/scope-registry";
import { SyntaxTypeChecker } from "../syntax-type-checker/type-checkers/syntax-type-checker";
import { TypeScriptTypeTypeChecker } from "../syntax-type-checker/type-checkers/typescript-type-type-checker";

export class TransformerContext {
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

	constructor(
		public readonly program: ts.Program,
		public readonly config: Config,
		private readonly scopeAnalyzer: ScopeAnalyzer,
		private readonly scopeRegistry: ScopeRegistry,
		private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator
	) {
		this.typeChecker = program.getTypeChecker();
		this.dependencyManager = new DependencyManager(config);
		this.metadata = MetadataLibrary.init(this.dependencyManager);
		this.metadataManager = new MetadataManager(config, this.metadata, this.dependencyManager);
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
	}
}
