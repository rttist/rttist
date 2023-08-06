import * as ts from "typescript";
import { Scope } from "./scope";

export class ScopeRegistry {
	private readonly map = new Map<ts.Node, Scope>();

	createScope(originator: ts.Node, parent: Scope): Scope {
		const scope = new Scope(originator, parent);
		this.map.set(originator, scope);
		return scope;
	}

	getClosestScope(node: ts.Node): Scope | undefined {
		let scope;
		do {
			scope = this.map.get(node);

			if (scope !== undefined) {
				return scope;
			}

			node = node.parent;
		} while (node !== undefined);

		return undefined;
	}
}
