import * as ts                      from "typescript";
import { ParameterFlags }           from "rttist";
import { Context }                  from "../contexts/Context";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import { ParameterProperties }      from "../declarations/TypeProperties";
import { getDeclaration }           from "../utils/symbolHelpers";
import { getConstantValue }         from "./getConstantValue";
import { getDecoratorsProperties }  from "./getDecoratorsProperties";

/**
 * Process the signature of the method and create a parameter description for each parameter
 * @param signature
 * @param context
 */
export function getSignatureParametersProperties(
	signature: ts.Signature,
	context: Context
): Array<ParameterProperties> | undefined
{
	const signatureParameters = signature.getParameters();

	if (!signature || !signatureParameters?.length)
	{
		return undefined;
	}

	const parameters: Array<ParameterProperties> = [];

	for (let parameterSymbol of signatureParameters)
	{
		const declaration = getDeclaration<ts.ParameterDeclaration>(parameterSymbol);
		const type = declaration
			? context.typeChecker.getTypeOfSymbolAtLocation(parameterSymbol, declaration)
			: context.typeChecker.getDeclaredTypeOfSymbol(parameterSymbol);

		const optional = (parameterSymbol.flags & ts.SymbolFlags.Optional) !== 0;

		parameters.push({
			name: parameterSymbol.getName(),
			type: type === undefined
				? TransformerTypeReference.Any
				: context.metadata.referenceType(type, optional, undefined, undefined, context),
			flags: (
					optional
						? ParameterFlags.Optional
						: ParameterFlags.None
				)
				| (
					declaration?.dotDotDotToken !== undefined
						? ParameterFlags.Rest
						: ParameterFlags.None
				),
			initializer: declaration?.initializer !== undefined ? getConstantValue(declaration.initializer, context) : undefined,
			decorators: declaration !== undefined ? getDecoratorsProperties(declaration, context) : undefined
		});
	}

	return parameters.length === 0 ? undefined : parameters;
}