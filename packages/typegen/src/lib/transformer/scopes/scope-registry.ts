import * as ts from "typescript";
import { Scope } from "./scope";

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

export class ScopeRegistry {
	private readonly map = new Map<ts.Node, Scope>();

	doesCreateScope(node: ts.Node): boolean {
		return scopedSyntaxKinds.has(node.kind);
	}

	createScope(originator: ts.Node, parent?: Scope): Scope {
		const scope = new Scope(originator, parent);
		this.map.set(originator, scope);
		return scope;
	}

	getClosestScope(node: ts.Node): Scope {
		let scope;
		do {
			scope = this.map.get(node);

			if (scope !== undefined) {
				return scope;
			}
			node = node.parent;
		} while (node !== undefined);

		// Should never happen. At least SourceFile has Scope.
		return new Scope(node);
	}
}
