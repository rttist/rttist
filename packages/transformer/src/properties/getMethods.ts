import {
	AccessModifier,
	ParameterFlags,
	PropertyFlags
}                                           from "@rttist/abstract";
import * as ts                              from "typescript";
import type { Context }                     from "../contexts/Context";
import type {
	MethodProperties,
	SignatureProperties
}                                           from "../declarations/TypeProperties";
import { getAccessModifier }                from "../helpers";
import { getDeclaration }                   from "../utils/symbolHelpers";
import { getDecoratorsProperties }          from "./getDecoratorsProperties";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

/**
 * Return methods of Type.
 * @param context
 * @param type
 */
export function getMethods(type: ts.Type, context: Context): Array<MethodProperties> | undefined
{
	const members = type.getProperties();

	const methods = members
		.filter(m => (m.flags & ts.SymbolFlags.Method) === ts.SymbolFlags.Method || (m.flags & ts.SymbolFlags.Function) === ts.SymbolFlags.Function)
		.map(
			(memberSymbol: ts.Symbol) => {
				const declaration = getDeclaration(memberSymbol) as ts.FunctionLikeDeclaration;

				let type = declaration
					? context.typeChecker.getTypeOfSymbolAtLocation(memberSymbol, declaration)
					: context.typeChecker.getDeclaredTypeOfSymbol(memberSymbol);

				// TODO: Check why this has been written
				// If the return type is union with undefined
				// if (type.isUnion())
				// {
				// 	type = (type.types[0].flags === ts.TypeFlags.Undefined ? type.types[1] : type.types[0]) || type;
				// }

				const optional = (memberSymbol.flags & ts.SymbolFlags.Optional) !== 0;
				let accessModifier = getAccessModifier(memberSymbol.valueDeclaration?.modifiers);

				if (memberSymbol.name.charAt(0) === "#")
				{
					accessModifier = AccessModifier.Private;
				}

				return {
					accessModifier,
					name: memberSymbol.escapedName.toString(),
					signatures: getMethodSignatures(type, context),
					decorators: declaration ? getDecoratorsProperties(declaration, context) : [],
					flags: (
							optional
								? ParameterFlags.Optional
								: ParameterFlags.None
						)
						| (
							accessModifier === AccessModifier.Private
								? PropertyFlags.Private
								: accessModifier === AccessModifier.Protected
									? PropertyFlags.Protected
									: PropertyFlags.None
						),
				} as MethodProperties;
			}
		);

	return methods.length ? methods : undefined;
}

function getMethodSignatures(type: ts.Type, context: Context): SignatureProperties[]
{
	return type.getCallSignatures()
		.map(signature => ({
			parameters: getSignatureParametersProperties(signature, context),
			returnType: context.metadata.referenceType
			(
				signature.getReturnType(),
				undefined,
				context
			),
			typeParameters: signature.typeParameters
				?.map(typeParameter => context.metadata.referenceType(
					typeParameter,
					undefined,
					context
				)),
		}));
}