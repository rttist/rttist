import type { ModuleScope } from "./module-scope";
import * as ts from "typescript";
import { ModuleIdentifier } from "rttist";

export enum InfoKind {
	NamedDeclaration,
	ImportDeclaration,
	TypeParameterDeclaration,
	/**
	 * Any declaration creating a type: interface, class, type alias etc.
	 */
	AnyTypeDeclaration,
}

export type ImportDeclarationInfo =
	| {
			kind: InfoKind.ImportDeclaration;
			namespaceImport: false;
			declaredName: string;
			moduleId: ModuleIdentifier;
			declaration: ts.ImportDeclaration;
	  }
	| {
			kind: InfoKind.ImportDeclaration;
			namespaceImport: true;
			moduleId: ModuleIdentifier;
			declaration: ts.ImportDeclaration;
	  };

export type NamedDeclarationInfo = {
	kind: InfoKind.NamedDeclaration;
	declaration: ts.NamedDeclaration;
};

export type TypeParameterDeclarationInfo = {
	kind: InfoKind.TypeParameterDeclaration;
	declaration: ts.TypeParameterDeclaration | ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
};

export type AnyTypeDeclarationInfo = {
	kind: InfoKind.AnyTypeDeclaration;
	declaration: ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
};

export type DeclarationInfo = NamedDeclarationInfo;
export type TypeDeclarationInfo = TypeParameterDeclarationInfo | AnyTypeDeclarationInfo;

export class Scope {
	protected readonly declarations = new Map<string, DeclarationInfo>();
	protected readonly typeDeclarations: Map<string, TypeDeclarationInfo>;

	/**
	 * It's not exactly module scope; it's the top scope that is tracked.
	 * It should be scope of the SourceFile (so module scope).
	 */
	public readonly moduleScope: ModuleScope;

	/**
	 *
	 * @param originator Node that created this scope.
	 * @param parent Parent scope.
	 */
	constructor(originator: ts.Node, parent: Scope);
	constructor(
		private readonly originator: ts.Node,
		protected readonly parent?: Scope
	) {
		this.typeDeclarations = hasTypeParameters(originator)
			? new Map(
					originator.typeParameters.map((tp) => [
						tp.name.getText(),
						{
							kind: InfoKind.TypeParameterDeclaration,
							declaration: tp,
						},
					])
			  )
			: new Map();

		this.moduleScope = (parent?.moduleScope ?? this) as ModuleScope;
	}

	addDeclaration(name: string, declaration: DeclarationInfo): void {
		this.declarations.set(name, declaration);
	}

	addTypeDeclaration(name: string, declaration: TypeDeclarationInfo): void {
		this.typeDeclarations.set(name, declaration);
	}

	/**
	 * Return type declaration by name.
	 * @param name
	 */
	getTypeDeclaration(name: string): TypeDeclarationInfo | ImportDeclarationInfo | undefined {
		return (
			this.typeDeclarations?.get(name) ||
			this.parent?.getTypeDeclaration(name) ||
			this.moduleScope.getImportDeclaration(name)
		);
	}

	/**
	 * Return declaration by name.
	 * @param name
	 */
	getDeclaration(name: string): NamedDeclarationInfo | ImportDeclarationInfo | undefined {
		if (name === "this") {
			return {
				kind: InfoKind.NamedDeclaration,
				declaration: this.getContextScope()?.originator as ts.NamedDeclaration,
			};
		}

		return (
			this.declarations.get(name) ||
			this.parent?.getDeclaration(name) ||
			this.moduleScope.getImportDeclaration(name)
		);
	}

	private getContextScope(): Scope | undefined {
		let scope: Scope | undefined = this;

		do {
			if (scope.isContextNode()) {
				return scope;
			}
			scope = scope.parent;
		} while (scope !== undefined);

		return undefined;
	}

	/**
	 * Check if the originator creates "this" context.
	 */
	private isContextNode(): boolean {
		return (
			ts.isClassLike(this.originator) ||
			ts.isFunctionDeclaration(this.originator) ||
			ts.isFunctionExpression(this.originator) ||
			ts.isObjectLiteralExpression(this.originator)
		);
	}
}

function hasTypeParameters(
	node: ts.Node
): node is ts.Node & { typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> } {
	return (node as any).typeParameters !== undefined;
}
