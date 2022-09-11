import * as ts              from "typescript";
import { NodeBuilderFlags } from "typescript";
import { Context }          from "../contexts/Context";

export function interfaceVisitor(declaration: ts.InterfaceDeclaration, context: Context): ts.VisitResult<ts.Node>
{
	const type = context.typeChecker.getTypeAtLocation(declaration);

	// Add interface's type to the metadata.
	context.metadata.addTypeAndOrGetId(
		type,
		context.typeChecker.typeToTypeNode(type, declaration, NodeBuilderFlags.None),
		context
	);

	return declaration;

	// We have nothing to ALTER in interface
	// return ts.visitEachChild(
	// 	declaration,
	// 	(node: ts.Node) => visitInterfaceDeclaration(node, context),
	// 	context.transformationContext
	// );
}

// function visitInterfaceDeclaration(node: ts.Node, context: Context): ts.VisitResult<ts.Node>
// {
// 	return node;
// }