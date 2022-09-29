import {
	AccessModifier,
	Accessor,
	PropertyFlags
}                                   from "@rttist/abstract";
import * as ts                      from "typescript";
import { Context }                  from "../contexts/Context";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import { PropertyProperties }       from "../declarations/TypeProperties";
import { getModifiers }             from "../utils/modifierHelpers";
import {
	getDeclaration,
	getType
}                                   from "../utils/symbolHelpers";
import { getDecoratorsProperties }  from "./getDecoratorsProperties";

/**
 * Return properties of type.
 * @param members
 * @param context
 */
export function mapProperties(members: ts.Symbol[], context: Context): Array<PropertyProperties>/* | undefined*/
{
	return members
		.filter(m =>
			(m.flags & ts.SymbolFlags.Property) === ts.SymbolFlags.Property
			|| (m.flags & ts.SymbolFlags.GetAccessor) === ts.SymbolFlags.GetAccessor
			|| (m.flags & ts.SymbolFlags.SetAccessor) === ts.SymbolFlags.SetAccessor
		)
		.map<PropertyProperties>((memberSymbol: ts.Symbol) =>
		{
			const declaration = getDeclaration(memberSymbol);
			const accessor = getAccessor(declaration);
			const modifiers = getModifiers(declaration, memberSymbol);

			const optional = (memberSymbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional
				|| (
					declaration
					// && (
					// 	ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)
					// )
					&& (declaration as ts.PropertyDeclaration | ts.PropertySignature).questionToken !== undefined
				);

			const type = context.typeChecker.getDeclaredTypeOfSymbol(memberSymbol); // TODO: mnemo značky ctrl + 1 a ctrl + 2, bere se asi rozdílný symbol, takže se nevygenerují properties.
			// const type = getType(memberSymbol, declaration, context.typeChecker);

			// NOTE: Removing undefined from types of optional properties. This is not a good idea.
			// if (type && optional && context.config.parsedCommandLine?.options.strictNullChecks === true)
			// {
			// 	const addNullBack = type.isUnion() && type.types.some(t => (t.flags & ts.TypeFlags.Null) !== 0);
			//	
			// 	type = context.typeChecker.getNonNullableType(type);
			//	
			// 	if (addNullBack) {
			// 		type = context.typeChecker.getNullableType(type, ts.TypeFlags.Null);
			// 	}
			// }

			return {
				name: memberSymbol.escapedName.toString(),
				type: type === undefined ? TransformerTypeReference.Unknown : context.metadata.referenceType(
					type, /*declaration.type!*/
					memberSymbol,
					undefined,
					context
				),
				decorators: declaration === undefined ? undefined : getDecoratorsProperties(declaration, context),
				flags: (
						modifiers.readonly || accessor === Accessor.Getter
							? PropertyFlags.Readonly
							: PropertyFlags.None
					)
					| (optional ? PropertyFlags.Optional : PropertyFlags.None)
					| (
						accessor === Accessor.Getter
							? PropertyFlags.Getter
							: accessor === Accessor.Setter
								? PropertyFlags.Setter
								: PropertyFlags.None
					)
					| (
						modifiers.access === AccessModifier.Private
							? PropertyFlags.Private
							: modifiers.access === AccessModifier.Protected
								? PropertyFlags.Protected
								: PropertyFlags.None
					)
			};
		});
}

function getAccessor(node?: ts.Declaration): Accessor
{
	if (node != undefined)
	{
		if (node.kind === ts.SyntaxKind.GetAccessor)
		{
			return Accessor.Getter;
		}

		if (node.kind === ts.SyntaxKind.SetAccessor)
		{
			return Accessor.Setter;
		}
	}

	return Accessor.None;
}