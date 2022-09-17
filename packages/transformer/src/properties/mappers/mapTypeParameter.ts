import { TypeKind }                  from "@rttist/abstract";
import * as ts                       from "typescript";
import { UnknownTypeProperties }     from "../../consts";
import { Context }                   from "../../contexts/Context";
import { TypeMapperResult }          from "../../declarations/mappers";
import { getDeclaration }            from "../../utils/symbolHelpers";
import { getTypeSourceLocationText } from "../../utils/traceHelpers";
import { getTypeId }                 from "../../utils/typeHelpers";

export function mapTypeParameter(type: ts.Type, context: Context): TypeMapperResult
{
	const declaration = getDeclaration(type.symbol);

	if (declaration)
	{
		if (ts.isTypeParameterDeclaration(declaration))
		{
			return {
				id: getTypeId(type, context),
				kind: TypeKind.TypeParameter,
				name: declaration.name.escapedText as string,
				constraint: declaration.constraint && context.metadata.referenceType(
					context.typeChecker.getTypeAtLocation(declaration.constraint),
					undefined,
					context
				) || undefined,
				default: declaration.default && context.metadata.referenceType(context.typeChecker.getTypeAtLocation(declaration.default), undefined, context) || undefined
			};
		}
	}

	context.log.warn("Unhandled TypeParameter.\r\n\t" + getTypeSourceLocationText(type, context));
	return UnknownTypeProperties;
}