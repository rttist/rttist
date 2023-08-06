import { AccessModifier, ParameterFlags, PropertyFlags } from "rttist";
import * as ts from "typescript";
import { MethodProperties } from "../../../declarations/type-properties";
import { Context } from "../contexts/context";
import { getModifiers } from "../utils/modifier-helpers";
import { getDeclaration } from "../utils/symbolHelpers";
import { getCallSignatures } from "./get-call-signatures";
import { getDecoratorsProperties } from "./getDecoratorsProperties";
import { getMemberName } from "./getMemberName";

const METHOD_SYMBOL_PROPS = ts.SymbolFlags.Method | ts.SymbolFlags.Function;

/**
 * Return methods of Type.
 * @param members
 * @param context
 */
export function mapMethods(members: ts.Symbol[], context: Context): Array<MethodProperties> {
	return members
		.filter((m) => (m.flags & METHOD_SYMBOL_PROPS) !== 0)
		.map((memberSymbol: ts.Symbol) => {
			const declaration = getDeclaration(memberSymbol) as ts.FunctionLikeDeclaration;

			let type = declaration
				? context.typeChecker.getTypeOfSymbolAtLocation(memberSymbol, declaration)
				: context.typeChecker.getDeclaredTypeOfSymbol(memberSymbol);

			// If the return type is union with undefined - method is optional
			if (type.isUnion()) {
				type = (type.types[0].flags === ts.TypeFlags.Undefined ? type.types[1] : type.types[0]) || type;
			}

			const optional = (memberSymbol.flags & ts.SymbolFlags.Optional) !== 0;
			let modifiers = getModifiers(declaration, memberSymbol);

			return {
				name: getMemberName(memberSymbol, context),
				signatures: getCallSignatures(type, context),
				decorators: declaration ? getDecoratorsProperties(declaration, context) : [],
				flags:
					(optional ? ParameterFlags.Optional : ParameterFlags.None) |
					(modifiers.access === AccessModifier.Private
						? PropertyFlags.Private
						: modifiers.access === AccessModifier.Protected
						? PropertyFlags.Protected
						: PropertyFlags.None),
			} as MethodProperties;
		});
}
