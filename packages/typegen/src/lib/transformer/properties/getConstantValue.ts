import * as ts from "typescript";
import type { Context } from "../contexts/context";
import { getNodeLocationText } from "../tracers/getNodeLocationText";

export function getConstantValue(
	node: ts.Node,
	context: Context
): string | number | boolean | ts.PseudoBigInt | ts.PrimaryExpression | ts.KeywordTypeNode {
	const type = context.typeChecker.getTypeAtLocation(node);

	if (type.isLiteral()) {
		return type.value;
	}

	if (type.flags & ts.TypeFlags.BooleanLiteral) {
		return (type as any).intrinsicName === "true";
	}

	switch (node.kind) {
		case ts.SyntaxKind.NullKeyword:
			return ts.factory.createNull();
		case ts.SyntaxKind.UndefinedKeyword:
			return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
	}

	if ((type as any).intrinsicName === "undefined") {
		return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
	}

	if (context.transformerContext.config.devMode) {
		context.log.ifWarn(() => [
			"Unexpected value. Only constant values are allowed.\n\t" + getNodeLocationText(node),
		]);
	}

	return ts.factory.createNull();
}
