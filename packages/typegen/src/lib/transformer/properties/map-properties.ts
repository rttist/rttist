import { AccessModifier, Accessor, PropertyFlags } from "rttist";
import * as ts from "typescript";
import { DecoratorProperties, PropertyProperties } from "../../../declarations/type-properties";
import { TransformerTypeReference } from "../../metadata/transformer-type-reference";
import { Context } from "../contexts/context";
import { getModifiers } from "../utils/modifier-helpers";
import { getMemberName } from "./getMemberName";
import { getDeclaration, getType } from "../utils/symbolHelpers";
import { getDecoratorsProperties } from "./getDecoratorsProperties";

const PROP_SYMBOL_FLAGS = ts.SymbolFlags.Property | ts.SymbolFlags.GetAccessor | ts.SymbolFlags.SetAccessor;

/**
 * Return properties of type.
 * @param members
 * @param context
 */
export function mapProperties(members: ts.Symbol[], context: Context): Array<PropertyProperties> {
	return members
		.filter((m) => (m.flags & ts.SymbolFlags.Prototype) === 0 && (m.flags & PROP_SYMBOL_FLAGS) !== 0)
		.map<PropertyProperties>((memberSymbol: ts.Symbol) => {
			// TODO: PropertySignature
			const declaration = getDeclaration<ts.PropertyDeclaration /* | ts.PropertySignature*/>(memberSymbol);
			const accessor = getAccessor(declaration);
			const modifiers = getModifiers(declaration, memberSymbol);
			const optional =
				(memberSymbol.flags & ts.SymbolFlags.Optional) !== 0 ||
				(declaration !== undefined && declaration.questionToken !== undefined);

			let decorators: DecoratorProperties[] | undefined = undefined;
			let type = TransformerTypeReference.Invalid;

			if (declaration) {
				decorators = getDecoratorsProperties(declaration, context);

				// If Type is declared
				if (declaration.type !== undefined) {
					type = context.transformerContext.syntaxTypeChecker.getType(declaration.type);
				}
				// In case the type is not declared, we'll use TS's TypeChecker to get the type.
				else if (declaration.initializer !== undefined) {
					const initializerType = getType(memberSymbol, declaration, context.typeChecker);
					type = context.transformerContext.tsTypeTypeChecker.getType(initializerType, undefined, false);
				}
			}

			return {
				name: getMemberName(memberSymbol, context),
				type: type,
				decorators: decorators,
				flags:
					(modifiers.readonly || accessor === Accessor.Getter ? PropertyFlags.Readonly : PropertyFlags.None) |
					(optional ? PropertyFlags.Optional : PropertyFlags.None) |
					(accessor === Accessor.Getter
						? PropertyFlags.Getter
						: accessor === Accessor.Setter
						? PropertyFlags.Setter
						: PropertyFlags.None) |
					(modifiers.access === AccessModifier.Private
						? PropertyFlags.Private
						: modifiers.access === AccessModifier.Protected
						? PropertyFlags.Protected
						: PropertyFlags.None),
			};
		});
}

function getAccessor(node?: ts.Declaration): Accessor {
	if (node !== undefined) {
		if (node.kind === ts.SyntaxKind.GetAccessor) {
			return Accessor.Getter;
		}

		if (node.kind === ts.SyntaxKind.SetAccessor) {
			return Accessor.Setter;
		}
	}

	return Accessor.None;
}
