import * as ts     from "typescript";
import { Context } from "../contexts/Context";

export function getTypeParametersMap(declaration: ts.SignatureDeclarationBase, context: Context)
{
	return declaration.typeParameters?.reduce(
			(
				indexedTypes,
				typeParameterNode,
				index
			) => {
				indexedTypes.set(context.typeChecker.getTypeAtLocation(typeParameterNode), index);
				return indexedTypes;
			},
			new Map<ts.Type, number>()
		)
		?? new Map<ts.Type, number>();
}