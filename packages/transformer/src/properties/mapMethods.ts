import {
	AccessModifier,
	ParameterFlags,
	PropertyFlags
}                                  from "rttist";
import * as ts                     from "typescript";
import type { Context }            from "../contexts/Context";
import type { MethodProperties }   from "../declarations/TypeProperties";
import { getModifiers }            from "../utils/modifierHelpers";
import { getDeclaration }          from "../utils/symbolHelpers";
import { getCallSignatures }       from "./getCallSignatures";
import { getDecoratorsProperties } from "./getDecoratorsProperties";
import { getMemberName }           from "./getMemberName";

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
					signatures: getCallSignatures(type, context),
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