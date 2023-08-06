import { TypeIds } from "@rttist/core";
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

			// const typeReferenceNode = declaration.type;
			// let typeId;
			//
			// if (typeReferenceNode) {
			// 	typeId = generateTypeId(typeReferenceNode, "", context.transformerContext.scopeRegistry.)
			// }
			//
			// const context.typeChecker.getTypeAtLocation(typeReferenceNode);
			//
			//
			let decorators: DecoratorProperties[] | undefined = undefined;
			let type = TransformerTypeReference.Invalid;

			// It has type declaration
			if (declaration) {
				decorators = getDecoratorsProperties(declaration, context);

				if (declaration.type !== undefined) {
					type = context.transformerContext.syntaxTypeChecker.getType(declaration.type);
				} else if (declaration.initializer !== undefined) {
					const initializerSymbol: ts.Symbol =
						(declaration.initializer as any).symbol ??
						context.typeChecker.getSymbolAtLocation(declaration.initializer);

					if (initializerSymbol === undefined) {
						// TODO: In case that initializer has no symbol we have to use TypeChecker and generate type ID using the TS's Type.
						const initializerType = getType(memberSymbol, declaration, context.typeChecker);

						type = context.transformerContext.tsTypeTypeChecker.getType(initializerType, undefined, false);

						// const s = initializerType.getSymbol();
						// if (initializerType.isLiteral()) {
						// 	type = context.transformerContext.syntaxTypeChecker.getType(declaration.initializer);
						// } else {
						// type = context.transformerContext.syntaxTypeChecker.getType(declaration.initializer, true);
						// }
					} else {
						const initializerTypeDeclaration = getDeclaration(initializerSymbol);

						if (initializerTypeDeclaration !== undefined) {
							type = context.transformerContext.syntaxTypeChecker.getType(initializerTypeDeclaration);
						}
					}
				}

				// type = new TransformerTypeReference(
				// 	(declaration?.type &&
				// 		generateTypeId(
				// 			declaration.type,
				// 			"",
				// 			context.transformerContext.scopeManager.getClosestScope(declaration)
				// 		)) ||
				// 		TypeIds.Invalid
				// );
			}

			// 	const initializerSymbol =
			// 		declaration !== undefined && declaration.type === undefined && declaration.initializer !== undefined
			// 			? (declaration.initializer as any).symbol ||
			// 			  context.typeChecker.getSymbolAtLocation(declaration.initializer)
			// 			: undefined;
			//
			// const type =
			// 	initializerSymbol !== undefined
			// 		? context.typeChecker.getDeclaredTypeOfSymbol(initializerSymbol)
			// 		: getType(memberSymbol, declaration, context.typeChecker);
			//
			// // Provide symbol when there is an initializer and it is not reference/alias.
			// const provideSymbol =
			// 	initializerSymbol !== undefined &&
			// 	((context.typeChecker.getTypeAtLocation(declaration!.initializer!) as ts.ObjectType).objectFlags &
			// 		ts.ObjectFlags.Anonymous) !==
			// 		0;

			// const ref = context.metadata.referenceType(
			// 	type,
			// 	optional,
			// 	provideSymbol ? memberSymbol : undefined,
			// 	undefined,
			// 	context
			// );

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

			context.log.warn("prop: ", getMemberName(memberSymbol, context), type);

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
