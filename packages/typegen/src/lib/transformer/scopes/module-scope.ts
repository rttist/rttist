import * as ts from "typescript";
import { ImportDeclarationInfo, Scope } from "./scope";

export class ModuleScope extends Scope {
	protected readonly importDeclarations = new Map<string, ImportDeclarationInfo>();

	/**
	 *
	 * @param originator Node that created this scope.
	 */
	constructor(originator: ts.SourceFile) {
		super(originator, null!);
	}

	addImportDeclaration(name: string, declaration: ImportDeclarationInfo): void {
		this.importDeclarations.set(name, declaration);
	}

	getImportDeclaration(name: string) {
		return this.importDeclarations.get(name);
	}
}
