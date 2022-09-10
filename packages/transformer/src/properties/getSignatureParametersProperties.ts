import * as ts                     from "typescript";
import { AnyTypeReference }        from "../consts";
import { Context }                 from "../contexts/Context";
import { ParameterProperties }     from "../declarations/TypeProperties";
import { getDeclaration }          from "../utils/symbolHelpers";
import { getConstantValue }        from "./getConstantValue";
import { getDecoratorsProperties } from "./getDecoratorsProperties";

/**
 * Process the signature of the method and create a parameter description for each parameter
 * @param signature
 * @param context
 */
export function getSignatureParametersProperties(signature: ts.Signature, context: Context): Array<ParameterProperties>
{
	const signatureParameters = signature.getParameters();

	if (!signature || !signatureParameters?.length)
	{
		return [];
	}

	const parameters: Array<ParameterProperties> = [];

	for (let parameterSymbol of signatureParameters)
	{
		const declaration = getDeclaration<ts.ParameterDeclaration>(parameterSymbol);

		if (declaration)
		{
			const type = context.typeChecker.getTypeOfSymbolAtLocation(parameterSymbol, declaration);

			parameters.push({
				name: parameterSymbol.getName(),
				type: type === undefined
					? AnyTypeReference
					: context.metadata.addTypeAndOrGetId(type, undefined, context),
				optional: (parameterSymbol.flags & ts.SymbolFlags.Optional) !== 0,// declaration.questionToken !== undefined || declaration.initializer !== undefined, // TODO: Check if the flag is OK with initializers
				rest: declaration.dotDotDotToken !== undefined,
				initializer: getConstantValue(declaration, context),
				decorators: getDecoratorsProperties(declaration, context)
			});
		}
		else
		{
			// TODO: Implement some ELSE logic
		}
	}

	return parameters;
}