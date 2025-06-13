import type { ModuleIdentifier } from "rttist";
import type * as ts from "typescript";
import { type ImportDeclarationInfo, Scope } from "./scope";

export class ModuleScope extends Scope {
	protected readonly importDeclarations = new Map<string, ImportDeclarationInfo>();

	/**
	 *
	 * @param originator Node that created this scope.
	 * @param id
	 */
	constructor(
		originator: ts.SourceFile,
		public readonly id: ModuleIdentifier
	) {
		super(originator, null!);
	}

	addImportDeclaration(name: string, declaration: ImportDeclarationInfo): void {
		this.importDeclarations.set(name, declaration);
	}

	getImportDeclaration(name: string) {
		return this.importDeclarations.get(name);
	}

	getImportedModuleIdentifiers() {
		return Array.from(this.importDeclarations.values()).map((x) => x.moduleId);
	}
}
