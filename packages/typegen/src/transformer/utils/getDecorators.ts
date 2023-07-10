import * as ts from "typescript";

export function getDecorators(node: ts.Declaration): readonly ts.Decorator[] | undefined {
	if (!ts.canHaveDecorators(node)) {
		return undefined;
	}

	return ts.getDecorators(node);
}
