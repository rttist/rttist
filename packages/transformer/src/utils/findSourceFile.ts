import * as ts                from "typescript";
import { TransformerContext } from "../contexts/TransformerContext";

export function getSourceFile(importDeclaration: ts.ImportDeclaration): ts.SourceFile | undefined
{
	return TransformerContext.instance.checker.getSymbolAtLocation(importDeclaration.moduleSpecifier)?.valueDeclaration as ts.SourceFile;
}