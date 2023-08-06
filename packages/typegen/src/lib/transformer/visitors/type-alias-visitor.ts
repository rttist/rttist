import * as ts from "typescript";
import { Context } from "../contexts/context";

// TODO: Check out ts.TypeOnlyAliasDeclaration and ts.TypeOnlyCompatibleAliasDeclaration

export function typeAliasVisitor(declaration: ts.TypeAliasDeclaration, context: Context): ts.VisitResult<ts.Node> {
	// This is not true already!
	// // TODO: This will never return type of the TypeAlias if the TypeAlias is just something like `type X = Y;`
	// // and there is no way to get the right type. If such aliases should be supported, we must change whole logic
	// // and pass symbols instead of types through whole system.
	// // Here `declarations.symbol` holds the correct symbol of such alias. That symbol property is not visible.

	const type = context.typeChecker.getTypeAtLocation(declaration);

	// Add type alias to the metadata.
	context.metadata.generateMetadataForType(
		context.transformerContext.syntaxTypeChecker.getType(declaration),
		type,
		false,
		(declaration as any).symbol || context.typeChecker.getSymbolAtLocation(declaration.name),
		undefined,
		context
	);

	return declaration;
}
