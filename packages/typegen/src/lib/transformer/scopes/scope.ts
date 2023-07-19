import * as ts from "typescript";

export class Scope {
	private readonly declarations = new Map<string, ts.NamedDeclaration>();
	private readonly genericParameters?: Map<string, ts.TypeParameterDeclaration>;

	/**
	 *
	 * @param originator Node that created this scope.
	 * @param parent Parent scope.
	 */
	constructor(
		private readonly originator: ts.Node,
		private readonly parent?: Scope
	) {
		if (hasTypeParameters(originator)) {
			this.genericParameters = new Map(originator.typeParameters.map((tp) => [tp.name.getText(), tp]));
		}
	}

	addDeclaration(node: ts.NamedDeclaration): void {
		this.declarations.set(node.getText(), node);
	}

	/**
	 * Return declaration by name.
	 * @param name
	 */
	getDeclaration(name: string): ts.NamedDeclaration | undefined {
		if (name === "this") {
			return this.getContextScope()?.originator as ts.NamedDeclaration;
		}

		return this.declarations.get(name) || this.genericParameters?.get(name) || this.parent?.getDeclaration(name);
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
