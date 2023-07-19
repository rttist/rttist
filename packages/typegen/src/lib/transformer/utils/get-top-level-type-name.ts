import * as ts from "typescript";

export function getTopLevelTypeName(node: ts.Identifier | ts.QualifiedName): ts.Identifier | undefined {
	do {
		if (ts.isIdentifier(node)) {
			return node;
		}

		node = node.left;
	} while (node !== undefined);

	return undefined;
}
