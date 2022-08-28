import {
	AccessModifier,
	Accessor,
	TypeKind
}                         from "@rtti/abstract";
import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import {
	PropertyProperties,
	UnknownTypeReference
}                         from "../declarations";
import { getDecorators }  from "../getDecorators";
import {
	getAccessModifier,
	getAccessor,
	getType,
	isReadonly
}                         from "../helpers";
import { getDeclaration } from "../utils/symbolHelpers";

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
				type: type && context.metadata.addType(type, /*declaration.type!*/undefined, context) || UnknownTypeReference,
				decorators: getDecorators(memberSymbol, context),
				accessModifier: getAccessModifier(declaration?.modifiers),
				accessor: accessor,
				readonly: isReadonly(declaration?.modifiers) || accessor == Accessor.Getter,
				optional: optional
			};
		});


	// const properties = type.getProperties();
	// const result: Array<PropertyProperties> = [];
	//
	// for (let prop of properties)
	// {
	// 	const declaration = getDeclaration(prop) as ts.PropertyDeclaration;
	//	
	// 	if (declaration) {
	// 		const accessor = getAccessor(declaration);
	// 		const propType = getType(prop, context);
	//
	// 		result.push({
	// 			name: prop.name,
	// 			type: context.metadata.addType(propType, /*declaration.type!*/undefined, context), // TODO: Předělat na resolveType(Type, TypeNode?) nebo resolveAnd
	// 			decorators: getDecorators(prop, context),
	// 			accessModifier: getAccessModifier(declaration.modifiers),
	// 			accessor: accessor,
	// 			readonly: isReadonly(declaration.modifiers) || accessor == Accessor.Getter,
	// 			optional: declaration && (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) && !!declaration.questionToken
	// 		});
	// 	}
	// 	else {
	// 		result.push({
	// 			name: prop.name,
	// 			type: { kind: TypeKind.Unknown },
	// 			decorators: getDecorators(prop, context),
	// 			accessModifier: AccessModifier.Public,
	// 			accessor: Accessor.None,
	// 			readonly: false,
	// 			optional: false
	// 		});
	// 	}
	// }
	//
	// return result;


	// TODO: Properties
	// if (symbol?.members)
	// {
	// 	const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);
	//
	// 	const properties = members
	// 		.filter(m => (m.flags & ts.SymbolFlags.Property) == ts.SymbolFlags.Property || (m.flags & ts.SymbolFlags.GetAccessor) == ts.SymbolFlags.GetAccessor || (m.flags & ts.SymbolFlags.SetAccessor) == ts.SymbolFlags.SetAccessor)
	// 		.map((memberSymbol: ts.Symbol) =>
	// 		{
	// 			const declaration = getDeclaration(memberSymbol);
	// 			const accessor = getAccessor(declaration);
	// 			const resolvedType = getType(memberSymbol, context);
	//
	// 			return {
	// 				name: memberSymbol.escapedName.toString(),
	// 				type: resolvedType ? context.metadata.addType(resolvedType) : UnknownTypeReference,
	// 				// t: resolvedType ? getTypeCall(resolvedType, memberSymbol, context, getCtorTypeReference(memberSymbol)) : getUnknownTypeCall(context),
	// 				decorators: getDecorators(memberSymbol, context),
	// 				accessModifier: getAccessModifier(declaration?.modifiers),
	// 				accessor: accessor,
	// 				readonly: isReadonly(declaration?.modifiers) || accessor == Accessor.Getter,
	// 				optional: declaration && (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) && !!declaration.questionToken
	// 			};
	// 		});
	//
	// 	return properties.length ? properties : undefined;
	// }

	// Note: array
	// // If type is Array
	// const resolvedTypeArguments: readonly ts.Type[] = context.typeChecker.getTypeArguments(type as ts.TypeReference);//(type as any).resolvedTypeArguments;
	//
	// if (resolvedTypeArguments)
	// {
	// 	const properties = resolvedTypeArguments.map((type: ts.Type, index: number) =>
	// 	{
	// 		// TODO: Returning properties for Array is OK only in case that Array is Literal (eg. [number, string]). If it's generic Array (eg. Array<string>), it has unknown props but known generic type.
	// 		return {
	// 			name: index.toString(),
	// 			type: getTypeCall(type, undefined, context)
	// 		};
	// 	});
	//
	// 	return properties.length ? properties : undefined;
	// }

	return undefined;
}
