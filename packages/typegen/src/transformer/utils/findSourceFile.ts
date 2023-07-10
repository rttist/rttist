import * as ts from "typescript";
import type { TransformerContext } from "../contexts/transformer-context";

export function getSourceFile(
	importDeclaration: ts.ImportDeclaration,
	transformerContext: TransformerContext
): ts.SourceFile | undefined {
	return transformerContext.typeChecker.getSymbolAtLocation(importDeclaration.moduleSpecifier)
		?.valueDeclaration as ts.SourceFile;
}
