import * as ts from "typescript";
import { Context } from "../contexts/context";

export function interfaceVisitor(declaration: ts.InterfaceDeclaration, context: Context): void {
	const type = context.typeChecker.getTypeAtLocation(declaration);

	// Add interface's type to the metadata.
	context.metadata.generateMetadataForType(
		context.transformerContext.syntaxTypeChecker.getType(declaration),
		type,
		false,
		context.typeChecker.getSymbolAtLocation(declaration),
		undefined,
		context
	);

	if (declaration.typeParameters) {
		context.metadata.generateMetadataForTypeParameters(declaration.typeParameters, context);
	}
}
