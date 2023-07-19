import * as ts from "typescript";

export function isExported(declaration: ts.Declaration): boolean
{
	return ts.canHaveModifiers(declaration)
		&& ts.getModifiers(declaration)?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword) === true;
}