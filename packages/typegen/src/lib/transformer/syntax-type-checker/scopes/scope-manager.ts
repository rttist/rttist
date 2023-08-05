import * as ts from "typescript";
import { ScopeAnalyzer } from "../scope-analyzer";
import { Scope } from "./scope";
import { ScopeRegistry } from "./scope-registry";

export class ScopeManager {
	private transformationContext?: ts.TransformationContext;

	constructor(
		private readonly scopeAnalyzer: ScopeAnalyzer,
		private readonly scopeRegistry: ScopeRegistry
	) {}

	setTransformationContext(transformationContext: ts.TransformationContext): void {
		this.transformationContext = transformationContext;
	}

	getClosestScope(node: ts.Node): Scope {
		if (this.transformationContext === undefined) {
			throw new Error("Transformation context not set.");
		}

		const sourceFile = node.getSourceFile();
		this.scopeAnalyzer.analyzeSourceFile(sourceFile, this.transformationContext);

		return this.scopeRegistry.getClosestScope(node);
	}
}
