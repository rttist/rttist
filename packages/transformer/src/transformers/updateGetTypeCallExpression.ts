import * as ts                            from "typescript";
import { TransformerTypeReference }       from "../declarations/general";
import { createAccessToGenericParameter } from "../expression-utils/createAccessToGenericParameter";
import type { Context }                   from "../contexts/Context";
import { getNodeLocationText }            from "../utils/traceHelpers";

// TODO: Rename and move. This should not be Update yet. Type parameters from getType<T>() should be reflected.
export function updateGetTypeCallExpression(context: Context, node: ts.CallExpression): ts.VisitResult<ts.Node>
{
	// First type argument.
	let typeArgumentNode = node.typeArguments![0];

	// Type of the Type parameter node.
	let typeArgumentType = context.typeChecker.getTypeAtLocation(typeArgumentNode);

	// If the type parameter is another type parameter; replace by "__typeParam__.X", where X is name of generic parameter
	if (typeArgumentType.flags === ts.TypeFlags.TypeParameter) // TODO: If it is declared on class, replace by Reflect.getType(this).getTypeParameters()[index of required generic type]
	{
		if (ts.isTypeReferenceNode(typeArgumentNode))
		{
			if (ts.isIdentifier(typeArgumentNode.typeName))
			{
				// TODO: When visiting class declaration, set some info on ts.Type of TypeParameters so we can access it here.

				const s = typeArgumentType.symbol;
				const typeParameterSymbol = context.typeChecker.getSymbolAtLocation(typeArgumentNode);

				return createAccessToGenericParameter(typeArgumentNode.typeName, context); // TODO: Check that genericTypeNode is a function or method type parameter (genericTypeNode.parent?). Because it can be class type parameter and this will throw Error, cuz there will be no variable "__genericParam__" declared
			}
		}

		context.log.warn("Unhandled case of access to type parameter.\n\t" + getNodeLocationText(typeArgumentNode));
		return context.metadata.nodeFactory.createTypeResolver(TransformerTypeReference.Unknown);
	}
	// Parameter is specific type
	else
	{
		return context.metadata.nodeFactory.createTypeResolver(
			context.metadata.referenceType(typeArgumentType/*, genericTypeNode*/, undefined, context)
		);
	}
}
