import type { TransformerContext } from "../contexts/TransformerContext";
import * as ts                     from "typescript";

export function getSourceFile(
	importDeclaration: ts.ImportDeclaration,
	transformerContext: TransformerContext
): ts.SourceFile | undefined
{
	return transformerContext.typeChecker.getSymbolAtLocation(importDeclaration.moduleSpecifier)?.valueDeclaration as ts.SourceFile;
}