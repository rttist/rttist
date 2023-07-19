import * as ts from "typescript";

export function isNamedDeclaration(
	declaration: ts.Declaration
): declaration is ts.NamedDeclaration & { name: ts.DeclarationName } {
	return (declaration as any).name !== undefined;
}
