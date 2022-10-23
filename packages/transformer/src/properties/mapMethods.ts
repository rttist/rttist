import {
	AccessModifier,
	ParameterFlags,
	PropertyFlags
}                                           from "rttist";
import * as ts                              from "typescript";
import type { Context }                     from "../contexts/Context";
import type {
	MethodProperties,
	SignatureProperties
}                                           from "../declarations/TypeProperties";
import { getMemberName }                    from "../utils/getMemberName";
import { getModifiers }                     from "../utils/modifierHelpers";
import { getDeclaration }                   from "../utils/symbolHelpers";
import { getDecoratorsProperties }          from "./getDecoratorsProperties";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

const METHOD_SYMBOL_PROPS = ts.SymbolFlags.Method | ts.SymbolFlags.Function;

/**
 * Return methods of Type.
 * @param members
 * @param context
 */
export function mapMethods(members: ts.Symbol[], context: Context): Array<MethodProperties>
{
	const methods = members
		.filter(m => (m.flags & METHOD_SYMBOL_PROPS) !== 0)
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
					name: getMemberName(memberSymbol, context),
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
}

function getMethodSignatures(type: ts.Type, context: Context): SignatureProperties[]
{
	return type.getCallSignatures()
		.map(signature => ({
			parameters: getSignatureParametersProperties(signature, context),
			returnType: context.metadata.referenceType
			(
				signature.getReturnType(),
				undefined, // TODO: This can be a problem and not just here. If we don't get symbol from declaration, the symbol from type will be received, which will be symbol of the simplified type. Image case: `type X = string; function x(): X {} getType<x>().returnType.is(getType<X>())` it will return false, because getType<X>() will return X and getType<x>().returnType return string. Maybe it's OK cuz getType<X>() should return TypeAliasType. So everybody should check if (type.isAlias()) type.target ==; And TypeAliasType.is can be overriden to do this.target.is(typeToCheck). 
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