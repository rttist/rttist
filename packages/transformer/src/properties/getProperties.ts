import {
	AccessModifier,
	Accessor,
	PropertyFlags
}                                   from "@rttist/abstract";
import * as ts                      from "typescript";
import { Context }                  from "../contexts/Context";
import { TransformerTypeReference } from "../declarations/general";
import { PropertyProperties }       from "../declarations/TypeProperties";
import {
	getAccessModifier,
	getAccessor,
	getType,
	isReadonly
}                                   from "../helpers";
import { getDeclaration }           from "../utils/symbolHelpers";
import { getDecoratorsProperties }  from "./getDecoratorsProperties";

/**
 * Return properties of type
 * @param type
 * @param context
 */
export function getProperties(type: ts.Type, context: Context): Array<PropertyProperties> | undefined
{
	return type.getProperties()
		.filter(m =>
			(m.flags & ts.SymbolFlags.Property) === ts.SymbolFlags.Property
			|| (m.flags & ts.SymbolFlags.GetAccessor) === ts.SymbolFlags.GetAccessor
			|| (m.flags & ts.SymbolFlags.SetAccessor) === ts.SymbolFlags.SetAccessor
		)
		.map<PropertyProperties>((memberSymbol: ts.Symbol) =>
		{
			const declaration = getDeclaration(memberSymbol);
			const accessor = getAccessor(declaration);
			const accessModifier = getAccessModifier(declaration?.modifiers);
			const optional = (memberSymbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional
				|| (
					declaration
					&& (
						ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)
					)
					&& !!declaration.questionToken
				);

			let type = getType(memberSymbol, context);

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
				type: type === undefined ? TransformerTypeReference.Unknown : context.metadata.referenceType(type, /*declaration.type!*/undefined, context),
				decorators: declaration === undefined ? undefined : getDecoratorsProperties(declaration, context),
				flags: (
						isReadonly(declaration?.modifiers) || accessor === Accessor.Getter
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
						accessModifier === AccessModifier.Private
							? PropertyFlags.Private
							: accessModifier === AccessModifier.Protected
								? PropertyFlags.Protected
								: PropertyFlags.None
					)
			};
		});
}
