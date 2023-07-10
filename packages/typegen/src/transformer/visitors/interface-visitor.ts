import * as ts from "typescript";
import { Context } from "../contexts/context";

export function interfaceVisitor(declaration: ts.InterfaceDeclaration, context: Context): ts.VisitResult<ts.Node> {
	const type = context.typeChecker.getTypeAtLocation(declaration);

	// Add interface's type to the metadata.
	context.metadata.referenceType(
		type,
		false,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined,
		context
	);

	return declaration;
}
