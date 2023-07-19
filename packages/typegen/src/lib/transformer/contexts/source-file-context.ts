import * as ts from "typescript";
import { Config } from "../../config/config";
import { ModuleMetadata } from "../../metadata/module-metadata";
import { Scope } from "../scopes/scope";
import { ScopeRegistry } from "../scopes/scope-registry";
import { isDeclaration } from "../utils/is-declaration";
import { isNamedDeclaration } from "../utils/is-named-declaration";

export class SourceFileContext {
	// /**
	//  * ModuleIdentifier of the source file.
	//  */
	// public readonly moduleId: ModuleIdentifier;

	public readonly metadata: ModuleMetadata;

	/**
	 * Scope registry used to solve semantic code scopes.
	 */
	public scopeRegistry = new ScopeRegistry();

	constructor(
		public readonly sourceFile: ts.SourceFile,
		public readonly config: Config,
		private readonly transformationContext: ts.TransformationContext
	) {
		this.metadata = ModuleMetadata.createFromSourceFile(sourceFile, config);
	}

	/**
	 * Analyze and register semantic scopes of the source file.
	 */
	analyzeScopes() {
		this.generateScopes(this.sourceFile, undefined);
	}

	private generateScopes = (node: ts.Node, parentScope?: Scope) => {
		let scope = parentScope;

		if (this.scopeRegistry.doesCreateScope(node)) {
			scope = this.scopeRegistry.createScope(node, parentScope);
		} else if (scope && isDeclaration(node) && isNamedDeclaration(node)) {
			scope.addDeclaration(node);
		}

		ts.visitEachChild(
			node,
			(child) => {
				this.generateScopes(child, scope);
				return child;
			},
			this.transformationContext
		);
	};
}
