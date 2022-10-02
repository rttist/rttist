import * as ts                       from "typescript";
import { ModuleIds }                 from "@rttist/core";
import { SyntaxKind }                from "typescript/lib/tsserverlibrary";
import { ESSymbols }                 from "../consts";
import type {
	ReflectedSymbolWithReference,
	ReflectedTypeWithReference
}                                    from "../declarations/general";
import { TransformerContext }        from "../contexts/TransformerContext";
import { printTypeDebugInfo }        from "../debugs/printTypeDebugInfo";
import { TransformerTypeReference }  from "../declarations/TransformerTypeReference";
import { log }                       from "../logging";
import { getComplexNativeTypeRef }   from "../properties/getComplexNativeTypeRef";
import { getPrimitiveTypeReference } from "../properties/getPrimitiveTypeReference";
import { getSourceFileId }           from "./getSourceFileId";
import { isExported }                from "./isExported";
import { getDeclaration }            from "./symbolHelpers";
import {
	getSymbol,
	getTypeId,
	getUniqueSymbolName,
	isInvalidType,
}                                    from "./typeHelpers";

function hasReflectedTypeReference(type: ts.Type): type is ReflectedTypeWithReference
function hasReflectedTypeReference(symbol: ts.Symbol): symbol is ReflectedSymbolWithReference
function hasReflectedTypeReference(typeOrSymbol: ts.Type | ts.Symbol): boolean
{
	return (typeOrSymbol as ReflectedTypeWithReference | ReflectedSymbolWithReference)._typeReference !== undefined;
}

function setReflectedTypeReference(
	type: ts.Type,
	symbol: ts.Symbol | undefined,
	ref: TransformerTypeReference
)
{
	if ((type as ReflectedTypeWithReference)._typeReference === undefined)
	{
		(type as ReflectedTypeWithReference)._typeReference = ref;
	}

	if (symbol !== undefined)
	{
		(symbol as ReflectedSymbolWithReference)._typeReference = ref;
	}
}

/**
 * Returns id of given type
 * @param type
 * @param symbol
 * @param typeChecker
 */
export function getTypeRef(
	type: ts.Type,
	symbol: ts.Symbol | undefined,
	typeChecker: ts.TypeChecker
): TransformerTypeReference
{
	if (isInvalidType(type))
	{
		return TransformerTypeReference.Unknown;
	}

	const primitiveTypeReference = getPrimitiveTypeReference(type);

	if (primitiveTypeReference !== undefined)
	{
		return primitiveTypeReference;
	}

	// const isAnonymous = ((type as any).objectFlags & ts.ObjectFlags.Anonymous) !== 0;
	// const isTypeAlias = symbol && (symbol.flags & ts.SymbolFlags.TypeAlias) !== 0 || false;
	// const useProvidedSymbol = isAnonymous || isTypeAlias;

	// Use symbol always when provided.
	const useProvidedSymbol = symbol !== undefined;

	// In case of TypeAlias ignore the stored ref on type, instead try to find the ref on the symbol.
	if (useProvidedSymbol && hasReflectedTypeReference(symbol!))
	{
		// console.log("!! Skipped thanks to stored type ref on symbol!", symbol._typeReference.id); // TODO: remove
		return symbol._typeReference;
	}

	if (!useProvidedSymbol && hasReflectedTypeReference(type))
	{
		// console.log("!! Skipped thanks to stored type ref on type!", type._typeReference.id); // TODO: remove
		return type._typeReference;
	}

	let typeReference: TransformerTypeReference | undefined = undefined;

	// If no symbol defined, take it from type
	if (symbol === undefined || !useProvidedSymbol)
	{
		symbol = getSymbol(type, typeChecker);
	}

	const declaration = getDeclaration(symbol);

	// If there is no declaration and/or symbol
	if (!declaration || !symbol)
	{
		return getTypeRefWithoutDeclaration(type, symbol, typeChecker);
	}

	const sourceFile = declaration.getSourceFile();
	const sourceFileId = getSourceFileId(sourceFile);

	// If it's type parameter
	if ((type.flags & ts.TypeFlags.TypeParameter) !== 0)
	{
		typeReference = getTypeRefOfTypeParameter(type, symbol, declaration, sourceFile, sourceFileId, typeChecker);
	}
	// TypeLiteral - it is not stored under any variable/alias anything, so we can generate "random" identifier.
	else if (declaration.kind === SyntaxKind.TypeLiteral)
	{
		typeReference = new TransformerTypeReference(
			sourceFileId,
			"AnonymousType:" + declaration.pos,
			undefined,
			undefined,
			sourceFile
		);
	}
	else
	{
		// TODO: It is important to distinguish Generic type definition and generic type
		const typeArguments = (type as ts.GenericType).typeArguments
			?.filter(t => (t.flags & ts.TypeFlags.TypeParameter) === 0 || (t.symbol as any)?.parent !== symbol) // TODO: Can be problem if the args is TypeParameter from some parent (eg. passing TypeParameter of class to some type of property)
			.map(typeArg => getTypeRef(typeArg, undefined, typeChecker).id) || [];

		// It has no type arguments and it is native type
		if (typeArguments.length === 0 && sourceFileId === ModuleIds.Native)
		{
			if ((type.flags & ts.TypeFlags.UniqueESSymbol) !== 0)
			{
				const name = getUniqueSymbolName(type);

				if (ESSymbols.has(name!))
				{
					return new TransformerTypeReference(
						ModuleIds.Native,
						"UniqueSymbol@" + name
					);
				}
			}

			typeReference = getComplexNativeTypeRef(type, symbol);

			if (typeReference === undefined)
			{
				if (TransformerContext.instance.config.devMode)
				{
					log.warn("Unhandled complex native type.", printTypeDebugInfo(type, typeChecker));
				}

				typeReference = TransformerTypeReference.Unknown;
			}
		}
		else
		{
			typeReference = getUnionOrIntersectionTypeRef(type, symbol, typeChecker);

			if (typeReference === undefined)
			{
				let typeName = symbol.escapedName.toString();

				if ((type.flags & ts.TypeFlags.UniqueESSymbol) !== 0)
				{
					let name = getUniqueSymbolName(type);
					typeName = name ? "UniqueSymbol@" + name : typeName;
				}

				// If it is not exported, the type name is not guaranteed to be unique.
				// So we will generate the path to the root declaration statement
				if (!isExported(declaration))
					// if (((type as any).objectFlags & ts.ObjectFlags.Anonymous) !== 0) 
				{
					let parentSymbol: ts.Symbol = (symbol as any).parent;

					while (parentSymbol !== undefined && (parentSymbol.flags & ts.SymbolFlags.Module) === 0)
					{
						typeName = parentSymbol.escapedName + "." + typeName;
						parentSymbol = (parentSymbol as any).parent;
					}
				}

				typeReference = new TransformerTypeReference(
					sourceFileId,
					typeName,
					undefined,
					typeArguments,
					sourceFile
				);
			}
		}
	}

	if (typeReference === undefined)
	{
		typeReference = TransformerTypeReference.Unknown;
		log.warn("Unhandled type kind. Unable to generate type id.", printTypeDebugInfo(type, typeChecker));
	}

	// Store the Reference on the type.
	setReflectedTypeReference(type, useProvidedSymbol ? symbol : undefined, typeReference);

	return typeReference;
}


function getTypeRefOfTypeParameter(
	type: ts.Type,
	symbol: ts.Symbol,
	declaration: ts.Declaration,
	sourceFile: ts.SourceFile,
	sourceFileId: string,
	typeChecker: ts.TypeChecker
)
{
	const parentSymbol = (type.symbol as any)?.parent; // TODO: WHy type.symbol and not just symbol?
	const parentType = parentSymbol && typeChecker.getDeclaredTypeOfSymbol(parentSymbol);

	if (parentType)
	{
		const parentRef = getTypeRef(parentType, parentSymbol, typeChecker);

		return new TransformerTypeReference(
			parentRef.moduleIdentifier,
			parentRef.name + ":" + symbol.escapedName,
			undefined,
			undefined,
			parentRef.sourceFile
		);
	}

	log.warn(
		"Unable to properly generate Id for a TypeParameter because parent type is unknown.",
		printTypeDebugInfo(type, typeChecker)
	);

	return new TransformerTypeReference(
		sourceFileId,
		symbol.escapedName + declaration.pos.toString(),
		undefined,
		undefined,
		sourceFile
	);
}

function getTypeRefWithoutDeclaration(
	type: ts.Type,
	symbol: ts.Symbol | undefined,
	typeChecker: ts.TypeChecker
): TransformerTypeReference
{
	// // try to check if it's primitive type
	// let typeReference = getPrimitiveTypeReference(type);
	//
	// if (typeReference === undefined)
	// {

	// Some system union or intersection.
	let typeReference = getUnionOrIntersectionTypeRef(type, symbol, typeChecker);

	if (typeReference === undefined)
	{
		log.warn(
			`Unable to generate Id for type without ${!symbol ? "symbol" : "declaration"}.`,
			printTypeDebugInfo(type, typeChecker)
		);

		typeReference = TransformerTypeReference.Unknown;
	}
	// }

	// TODO: Solve this, this reference was stored on native string type: 
	//  { module: "@quick-tests/dist/1/index", name: "__type.bar", id: "@quick-tests/dist/1/index::__type.bar" }
	// // In case it is a native primitive type and given symbol is not the same as type's symbol,
	// do not store reference generated over some alias directly on native string.
	// else if (type.symbol !== undefined && type.symbol !== symbol)
	// {
	// 	// Store the Reference on the type.
	// 	setReflectedTypeReference(type, symbol, typeReference);
	// 	return typeReference;
	// }

	// Store the Reference on the type.
	setReflectedTypeReference(type, symbol, typeReference);

	return typeReference;
}

function getUnionOrIntersectionTypeRef(type: ts.Type, symbol: ts.Symbol | undefined, typeChecker: ts.TypeChecker)
{
	if (type.isUnion())
	{
		return new TransformerTypeReference(
			ModuleIds.Native,
			"|",
			undefined,
			type.types.map(t => getTypeId(t, symbol, typeChecker))
		);
	}

	if (type.isIntersection())
	{
		return new TransformerTypeReference(
			ModuleIds.Native,
			"&",
			undefined,
			type.types.map(t => getTypeId(t, symbol, typeChecker))
		);
	}

	return undefined;
}