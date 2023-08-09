import { ModuleIdentifier } from "rttist";
import * as ts from "typescript";
import { Config } from "../../config/config";
import { ModuleIdentifierGenerator } from "./identifier-generators/module-identifier-generator";
import { ModuleScope } from "./scopes/module-scope";
import { AnyTypeDeclarationInfo, ImportDeclarationInfo, InfoKind, Scope } from "./scopes/scope";
import { ScopeRegistry } from "./scopes/scope-registry";
import { isDeclaration } from "../utils/is-declaration";
import { isNamedDeclaration } from "../utils/is-named-declaration";

const scopedSyntaxKinds = new Set([
	ts.SyntaxKind.SourceFile,
	ts.SyntaxKind.ModuleBlock,
	ts.SyntaxKind.InterfaceDeclaration,
	ts.SyntaxKind.ClassDeclaration,
	ts.SyntaxKind.ClassExpression,
	ts.SyntaxKind.MethodDeclaration,
	ts.SyntaxKind.FunctionDeclaration,
	ts.SyntaxKind.FunctionExpression,
	ts.SyntaxKind.ArrowFunction,
	ts.SyntaxKind.Block,
	// [ts.SyntaxKind.ForStatement]: true,
	// [ts.SyntaxKind.ForInStatement]: true,
	// [ts.SyntaxKind.ForOfStatement]: true,
	// [ts.SyntaxKind.WhileStatement]: true,
	// [ts.SyntaxKind.DoStatement]: true,
	// [ts.SyntaxKind.IfStatement]: true,
	// [ts.SyntaxKind.SwitchStatement]: true,
	// [ts.SyntaxKind.WithStatement]: true,
]);

const typeDeclarationKinds = new Set([
	ts.SyntaxKind.ClassDeclaration,
	ts.SyntaxKind.InterfaceDeclaration,
	ts.SyntaxKind.TypeAliasDeclaration,
]);

export class ScopeAnalyzer {
	private readonly analyzedSourceFiles = new WeakMap<ts.SourceFile, ModuleScope>();

	constructor(
		private readonly config: Config,
		private readonly scopeRegistry: ScopeRegistry,
		private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator
	) {}

	// /**
	//  * Get the module scope of the source file.
	//  * @param sourceFile
	//  * @param transformationContext
	//  */
	// public getModuleScope(sourceFile: ts.SourceFile, transformationContext: ts.TransformationContext): ModuleScope {
	// 	return this.analyzedSourceFiles.get(sourceFile) ?? this.analyzeSourceFile(sourceFile, transformationContext);
	// }

	/**
	 * Analyze and register semantic scopes of the source file.
	 */
	public analyzeSourceFile(sourceFile: ts.SourceFile, transformationContext: ts.TransformationContext): ModuleScope {
		const analyzedModuleScope = this.analyzedSourceFiles.get(sourceFile);

		if (analyzedModuleScope !== undefined) {
			return analyzedModuleScope;
		}

		const moduleScope = this.generateSourceFileScopes(sourceFile, transformationContext);

		// Store the analyzed module
		this.analyzedSourceFiles.set(sourceFile, moduleScope);

		return moduleScope;
	}

	private doesCreateScope(node: ts.Node): boolean {
		return scopedSyntaxKinds.has(node.kind);
	}

	private parseImports(sourceFile: ts.SourceFile) {
		// TODO: This is parsing and generating IDs for imported modules for second time; ModuleMetadata has references!

		const index = sourceFile.statements.findIndex((s) => !ts.isImportDeclaration(s));
		const imports = new Map<string, ImportDeclarationInfo>();
		let importDeclaration: ts.ImportDeclaration;

		for (let i = 0; i < index; i++) {
			importDeclaration = sourceFile.statements[i] as ts.ImportDeclaration;

			const moduleId: ModuleIdentifier = this.moduleIdentifierGenerator.generateImportedModuleIdentifier(
				sourceFile.fileName,
				importDeclaration.moduleSpecifier
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

	private generateSourceFileScopes(
		sourceFile: ts.SourceFile,
		transformationContext: ts.TransformationContext
	): ModuleScope {
		const moduleScope = new ModuleScope(
			sourceFile,
			this.moduleIdentifierGenerator.generateModuleIdentifier(sourceFile.fileName)
		);

		const imports: Map<string, ImportDeclarationInfo> = this.parseImports(sourceFile);

		for (const [name, info] of imports) {
			moduleScope.addImportDeclaration(name, {
				kind: InfoKind.ImportDeclaration,
				moduleId: info.moduleId,
				declaredName: (info as any).declaredName,
				declaration: info.declaration,
				namespaceImport: info.namespaceImport as false,
			});
		}

		ts.forEachChild(sourceFile, (child) => {
			this.generateScopes(child, moduleScope, transformationContext);
		});

		// ts.visitEachChild(
		// 	sourceFile,
		// 	(child) => {
		// 		this.generateScopes(child, moduleScope, transformationContext);
		// 		return child;
		// 	},
		// 	transformationContext
		// );

		return moduleScope;
	}

	private generateScopes(node: ts.Node, parentScope: Scope, transformationContext: ts.TransformationContext) {
		if (isDeclaration(node)) {
			if (isNamedDeclaration(node)) {
				// TODO: Get the text differently
				const name = node.name.getText();

				parentScope.addDeclaration(name, {
					kind: InfoKind.NamedDeclaration,
					declaration: node,
				});

				if (typeDeclarationKinds.has(node.kind)) {
					parentScope.addTypeDeclaration(name, {
						kind: InfoKind.AnyTypeDeclaration,
						declaration: node as AnyTypeDeclarationInfo["declaration"],
					});
				}
			}
		}

		let scope = this.doesCreateScope(node) ? this.scopeRegistry.createScope(node, parentScope) : parentScope;

		ts.forEachChild(node, (child) => {
			this.generateScopes(child, scope, transformationContext);
		});
		// ts.visitEachChild(
		// 	node,
		// 	(child) => {
		// 		this.generateScopes(child, scope, transformationContext);
		// 		return child;
		// 	},
		// 	transformationContext
		// );
	}
}
