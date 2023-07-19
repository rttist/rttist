import { ModuleIdentifier } from "rttist";
import * as ts from "typescript";
import { Config } from "../../config/config";
import { ModuleMetadata } from "../../metadata/module-metadata";
import { generateImportedModuleId } from "../id-generators";
import { ModuleScope } from "../scopes/module-scope";
import { ImportDeclarationInfo, InfoKind, Scope } from "../scopes/scope";
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
		const imports: Map<string, ImportDeclarationInfo> = this.parseImports();
		const moduleScope = new ModuleScope(this.sourceFile);

		for (const [name, info] of imports) {
			moduleScope.addImportDeclaration(name, {
				kind: InfoKind.ImportDeclaration,
				moduleId: info.moduleId,
				declaredName: (info as any).declaredName,
				declaration: info.declaration,
				namespaceImport: info.namespaceImport as false,
			});
		}

		this.generateScopes(this.sourceFile, moduleScope);
	}

	private parseImports() {
		// TODO: This is parsing and generating IDs for imported modules for second time; ModuleMetadata has references!

		const index = this.sourceFile.statements.findIndex((s) => !ts.isImportDeclaration(s));
		const imports = new Map<string, ImportDeclarationInfo>();
		let importDeclaration: ts.ImportDeclaration;

		for (let i = 0; i < index; i++) {
			importDeclaration = this.sourceFile.statements[i] as ts.ImportDeclaration;

			const moduleId: ModuleIdentifier = generateImportedModuleId(
				this.sourceFile.fileName,
				importDeclaration,
				this.config
			);

			if (importDeclaration.importClause) {
				// import x from ""; -> import default export
				if (importDeclaration.importClause.name) {
					imports.set(importDeclaration.importClause.name.text, {
						kind: InfoKind.ImportDeclaration,
						moduleId,
						namespaceImport: false,
						declaration: importDeclaration,
						declaredName: "default",
					});
				}

				if (importDeclaration.importClause.namedBindings) {
					// import { ... } from ""; -> named imports
					if (ts.isNamedImports(importDeclaration.importClause.namedBindings)) {
						for (const element of importDeclaration.importClause.namedBindings.elements) {
							imports.set(element.name.text, {
								kind: InfoKind.ImportDeclaration,
								moduleId,
								namespaceImport: false,
								declaration: importDeclaration,
								declaredName: element.propertyName ? element.propertyName.text : element.name.text,
							});
						}
					}
					// import * as x from ""; -> namespace import
					else if (ts.isNamespaceImport(importDeclaration.importClause.namedBindings)) {
						imports.set(importDeclaration.importClause.namedBindings.name.text, {
							kind: InfoKind.ImportDeclaration,
							moduleId,
							namespaceImport: true,
							declaration: importDeclaration,
						});
					} else {
						// TODO: What else it can be?
						// imports.set(importDeclaration.importClause.namedBindings.name.text, {
						// 	moduleId,
						// 	declaration: importDeclaration,
						// });
					}
				}
			}
		}

		return imports;
	}

	private generateScopes = (node: ts.Node, parentScope: Scope) => {
		let scope = parentScope;

		if (!ts.isSourceFile(node) && this.scopeRegistry.doesCreateScope(node)) {
			scope = this.scopeRegistry.createScope(node, parentScope);
		} else if (isDeclaration(node)) {
			if (isNamedDeclaration(node)) {
				scope.addDeclaration(node.getText(), {
					kind: InfoKind.NamedDeclaration,
					declaration: node,
				});
			} /*else if (ts.isImportDeclaration(node)) {
			}*/
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
