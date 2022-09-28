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
import { getModifiers }                     from "../utils/modifierHelpers";
import { getDeclaration }                   from "../utils/symbolHelpers";
import { getDecoratorsProperties }          from "./getDecoratorsProperties";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

/**
 * Return methods of Type.
 * @param members
 * @param context
 */
export function mapMethods(members: ts.Symbol[], context: Context): Array<MethodProperties>/* | undefined*/
{
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
				let modifiers = getModifiers(declaration, memberSymbol);

				return {
					accessModifier: modifiers.access,
					name: memberSymbol.escapedName.toString(),
					signatures: getMethodSignatures(type, context),
					decorators: declaration ? getDecoratorsProperties(declaration, context) : [],
					flags: (
							optional
								? ParameterFlags.Optional
								: ParameterFlags.None
						)
						| (
							modifiers.access === AccessModifier.Private
								? PropertyFlags.Private
								: modifiers.access === AccessModifier.Protected
									? PropertyFlags.Protected
									: PropertyFlags.None
						),
				} as MethodProperties;
			}
		);

	return methods;
	// return methods.length ? methods : undefined;
}

function getMethodSignatures(type: ts.Type, context: Context): SignatureProperties[]
{
	return type.getCallSignatures()
		.map(signature => ({
			parameters: getSignatureParametersProperties(signature, context),
			returnType: context.metadata.referenceType
			(
				signature.getReturnType(),
				undefined, // TODO: This can be a problem and just just here. If we don't get symbol from declaration, the symbol from type will be received, which will be symbol of the simplified type. Image case: `type X = string; function x(): X {} getType<x>().returnType.is(getType<X>())` it will return false, because getType<X>() will return X and getType<x>().returnType return string. Maybe it's OK cuz getType<X>() returns TypeAliasType. So everybody should check if (type.isAlias()) type.target ==; And TypeAliasType.is can be overriden to do this.target.is(typeToCheck). 
				undefined,
				context
			),
			typeParameters: signature.typeParameters
				?.map(typeParameter => context.metadata.referenceType(
					typeParameter,
					undefined,
					undefined,
					context
				)),
		}));
}