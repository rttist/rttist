import * as ts from "typescript";

export function getTopLevelIdentifier(node: ts.PropertyAccessExpression) {
	let nested;

	do {
		nested = node.expression as ts.PropertyAccessExpression | ts.Identifier;
		if (ts.isIdentifier(nested)) {
			return nested;
		}
		nested = node.expression;
	} while (nested !== undefined);

	return undefined;
}
