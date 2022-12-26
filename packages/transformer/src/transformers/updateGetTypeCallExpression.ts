import * as ts                            from "typescript";
import { TransformerTypeReference }       from "../declarations/TransformerTypeReference";
import { createAccessToGenericParameter } from "../expression-utils/createAccessToGenericParameter";
import type { Context }                   from "../contexts/Context";
import { getNodeLocationText }            from "../utils/traceHelpers";

// TODO: Rename and move. This should not be Update yet. Type parameters from getType<T>() should be reflected.
export function updateGetTypeCallExpression(node: ts.CallExpression, context: Context): ts.VisitResult<ts.Node>
{
	// First type argument.
	let typeArgumentNode: ts.TypeNode = node.typeArguments![0];

	// Type of the Type parameter node.
	let typeArgumentType = context.typeChecker.getTypeAtLocation(typeArgumentNode);

	// If the type parameter is another type parameter; replace by "__typeParam__.X", where X is name of generic parameter
	if (typeArgumentType.flags === ts.TypeFlags.TypeParameter) // TODO: If it is declared on class, replace by Rttist.getType(this).getTypeParameters()[index of required generic type]
	{
		if (ts.isTypeReferenceNode(typeArgumentNode))
		{
			if (ts.isIdentifier(typeArgumentNode.typeName))
			{
				// TODO: When visiting class declaration, set some info on ts.Type of TypeParameters so we can access it here.

				const s = typeArgumentType.symbol;

				return createAccessToGenericParameter(typeArgumentNode.typeName, context); // TODO: Check that genericTypeNode is a function or method type parameter (genericTypeNode.parent?). Because it can be class type parameter and this will throw Error, cuz there will be no variable "__genericParam__" declared
			}
		}

		context.log.warn("Unhandled case of access to type parameter.\n\t" + getNodeLocationText(typeArgumentNode));
		return context.metadata.nodeFactory.createTypeResolver(TransformerTypeReference.Unknown);
	}
	// Parameter is specific type
	else
	{
		const typeParameterSymbol: ts.Symbol = (typeArgumentNode as any).symbol || (
			ts.isTypeReferenceNode(typeArgumentNode)
				? context.typeChecker.getSymbolAtLocation(typeArgumentNode.typeName)
				: ts.isTypeQueryNode(typeArgumentNode)
					? context.typeChecker.getSymbolAtLocation(typeArgumentNode.exprName)
					: context.typeChecker.getSymbolAtLocation(typeArgumentNode)
		);

		return context.metadata.nodeFactory.createTypeResolver(
			context.metadata.referenceType(typeArgumentType, typeParameterSymbol, undefined, context)
		);
	}
}
