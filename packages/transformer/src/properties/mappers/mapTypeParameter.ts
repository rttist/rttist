import { TypeKind }              from "@rttist/abstract";
import * as ts                   from "typescript";
import { UnknownTypeProperties } from "../../consts";
import { Context }               from "../../contexts/Context";
import { printTypeDebugInfo }    from "../../debugs/printTypeDebugInfo";
import { TypeMapperResult }      from "../../declarations/mappers";
import { log }                   from "../../logging";
import { getDeclaration }        from "../../utils/symbolHelpers";

export function mapTypeParameter(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	const declaration = getDeclaration(type.symbol);

	if (declaration)
	{
		if (ts.isTypeParameterDeclaration(declaration))
		{
			return {
				kind: TypeKind.TypeParameter,
				name: declaration.name.escapedText as string,
				constraint: declaration.constraint && context.metadata.referenceType(
					context.typeChecker.getTypeAtLocation(declaration.constraint),
					undefined,
					undefined,
					context
				) || undefined,
				default: declaration.default && context.metadata.referenceType(
					context.typeChecker.getTypeAtLocation(declaration.default),
					undefined,
					undefined,
					context
				) || undefined
			};
		}
	}

	log.warn("Unhandled TypeParameter.\n\t" + printTypeDebugInfo(type, context.typeChecker));
	return UnknownTypeProperties;
}