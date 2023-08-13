import * as ts from "typescript";
import { ParameterFlags } from "rttist";
import { StaticValueType } from "../../../declarations/static-value-type";
import { DecoratorProperties, ParameterProperties } from "../../../declarations/type-properties";
import { TransformerTypeReference } from "../../metadata/transformer-type-reference";
import { Context } from "../contexts/context";
import { getDeclaration } from "../utils/symbolHelpers";
import { getConstantValue } from "./getConstantValue";
import { getDecoratorsProperties } from "./getDecoratorsProperties";

/**
 * Process the signature of the method and create a parameter description for each parameter
 * @param signature
 * @param context
 */
export function getSignatureParametersProperties(
	signature: ts.Signature,
	context: Context
): Array<ParameterProperties> | undefined {
	const signatureParameters = signature.getParameters();

	if (!signature || !signatureParameters?.length) {
		return undefined;
	}

	const parameters: Array<ParameterProperties> = [];

	for (let parameterSymbol of signatureParameters) {
		const declaration = getDeclaration<ts.ParameterDeclaration>(parameterSymbol);
		const optional = (parameterSymbol.flags & ts.SymbolFlags.Optional) !== 0;

		let type = TransformerTypeReference.Any;
		let initializer: StaticValueType | undefined;
		let decorators: Array<DecoratorProperties> | undefined;
		let restFlags = ParameterFlags.None;

		if (declaration) {
			// const parameterType = context.typeChecker.getTypeOfSymbolAtLocation(parameterSymbol, declaration);

			// Parameter type
			type = declaration.type
				? context.transformerContext.syntaxTypeChecker.getType(declaration.type)
				: context.transformerContext.tsTypeTypeChecker.getType(
					context.typeChecker.getTypeOfSymbolAtLocation(parameterSymbol, declaration),
					undefined,
					optional
				);
			// type = context.transformerContext.syntaxTypeChecker.getType(declaration.type);
			// type = context.transformerContext.metadata.generateMetadataForType(
			// 	declaration.type
			// 		? context.transformerContext.syntaxTypeChecker.getType(declaration.type)
			// 		: context.transformerContext.tsTypeTypeChecker.getType(parameterType, undefined, optional),
			// 	parameterType,
			// 	optional,
			// 	parameterSymbol,
			// 	undefined,
			// 	context
			// ).typeReference;

			// Initializer
			initializer =
				declaration.initializer !== undefined ? getConstantValue(declaration.initializer, context) : undefined;

			// Decorators
			decorators = getDecoratorsProperties(declaration, context);

			// Rest "..." flag
			if (declaration.dotDotDotToken !== undefined) {
				restFlags = ParameterFlags.Rest;
			}
		} else {
			const parameterType = context.typeChecker.getDeclaredTypeOfSymbol(parameterSymbol);
			type = context.transformerContext.tsTypeTypeChecker.getType(parameterType, parameterSymbol, optional);
			// type = context.transformerContext.metadata.generateMetadataForType(
			// 	context.transformerContext.tsTypeTypeChecker.getType(parameterType, parameterSymbol, optional),
			// 	parameterType,
			// 	optional,
			// 	parameterSymbol,
			// 	undefined,
			// 	context
			// ).typeReference;
		}

		parameters.push({
			name: parameterSymbol.getName(),
			type: type,
			flags: (optional ? ParameterFlags.Optional : ParameterFlags.None) | restFlags,
			initializer: initializer,
			decorators: decorators,
		});
	}

	return parameters.length === 0 ? undefined : parameters;
}
