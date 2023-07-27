import * as ts               from "typescript";
import { Context }           from "../contexts/Context";
import { TypeArgumentsInfo } from "../declarations/callsites";

export function getTypeArgumentsInfo(typeArguments: ts.NodeArray<ts.TypeNode>, context: Context)
{
	const typeArgTypes: TypeArgumentsInfo = [];

	for (let index = 0; index < typeArguments.length; index++)
	{
		const argTypeNode = typeArguments[index];

		typeArgTypes.push([
			context.typeChecker.getTypeFromTypeNode(argTypeNode),
			ts.isTypeReferenceNode(argTypeNode)
				? context.typeChecker.getSymbolAtLocation(argTypeNode.typeName)
				: undefined
		]);
	}

	return typeArgTypes;
}