import * as ts                            from "typescript";
import path                               from "path";
import {
	ModuleIdentifier,
	TypeIdentifier
}                                         from "@rttist/abstract";
import {
	ModuleIds,
	TypeIds
}                                         from "@rttist/core";
import { TransformerContext }             from "../contexts/TransformerContext";
import { printTypeDebugInfo }             from "../debugs/printTypeDebugInfo";
import {
	ReflectedSourceFileWithIdentifier,
	ReflectedTypeWithReference,
	TransformerTypeReference
}                                         from "../declarations/general";
import { PATH_SEPARATOR_REGEX }           from "../helpers";
import { log }                            from "../log";
import { getComplexNativeTypeProperties } from "../properties/getComplexNativeTypeProperties";
import { getPrimitiveTypeReference }      from "../properties/getPrimitiveTypeReference";
import { getDeclaration }                 from "./symbolHelpers";

/**
 * If the given type is some kind of alias or something which we don't want to reflect, find the right type.
 * @param type
 */
export function resolveType(type: ts.Type): ts.Type
{
	if (isReference(type))
	{
		return type.target;
	}

	// TODO: Implement; maybe the logic replacing true | false union for boolean etc.
	return type;
}

export function isReference(type: ts.Type): type is ts.TypeReference
{
	return isObject(type) && (type.objectFlags & ts.ObjectFlags.Reference) !== 0;
}

export function isObject(type: ts.Type): type is ts.ObjectType
{
	return (type.flags & ts.TypeFlags.Object) !== 0;
}

export function getSymbol(type: ts.Type, typeChecker: ts.TypeChecker): ts.Symbol | undefined
{
	if (type.symbol === undefined)
	{
		return undefined;
	}

	if ((type.symbol.flags & ts.SymbolFlags.Alias) !== 0)
	{
		return typeChecker.getAliasedSymbol(type.symbol);
	}

	return type.symbol;
}

export function getMajorTypeFlag(type: ts.Type)
{
	let flags = type.flags;

	// Boolean is Boolean | (true | false)
	if ((flags & ts.TypeFlags.Boolean) !== 0)
	{
		flags = ts.TypeFlags.Boolean;
	}
	return flags;
}

/**
 * Check if the type is an Array
 * @param type
 */
export function isArrayType(type: ts.Type): boolean
{
	// [Hookyns] Check if type is Array. I found no direct way to do so.
	return !!(type.flags & ts.TypeFlags.Object) && type.symbol?.escapedName === "Array"; // TODO: Check ObjectFlags && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.ArrayLiteral && ??
}

export function getTypeId(type: ts.Type, typeChecker: ts.TypeChecker): TypeIdentifier
{
	return getTypeRef(type, typeChecker).id || TypeIds.Invalid;
}

/**
 * Returns id of given type
 * @param type
 * @param typeChecker
 */
export function getTypeRef(type: ts.Type, typeChecker: ts.TypeChecker): TransformerTypeReference
{
	if (hasReflectedTypeReference(type))
	{
		return type._typeReference;
	}

	const symbol = getSymbol(type, typeChecker);
	const declaration = getDeclaration(symbol);

	if (!declaration || !symbol)
	{
		const primitiveTypeReference = getPrimitiveTypeReference(type);

		if (primitiveTypeReference !== undefined)
		{
			// Store the Reference on the type. Performance optimization.
			setReflectedTypeReference(type, primitiveTypeReference);

			return primitiveTypeReference;
		}

		log.warn("Unable to generate Id for type without declaration.", printTypeDebugInfo(type, typeChecker));

		// Store the unknown reference on the type. Otherwise it can cause issue because of native recursive types.
		setReflectedTypeReference(type, TransformerTypeReference.Unknown);

		return TransformerTypeReference.Unknown;
	}

	const sourceFile = declaration.getSourceFile();
	const sourceFileId = getSourceFileId(sourceFile);

	// TODO: It is important to distinguish Generic type definition and generic type
	const typeArguments = (type as ts.GenericType).typeArguments
		?.filter(t => (t.flags & ts.TypeFlags.TypeParameter) === 0 || (t.symbol as any)?.parent !== symbol) // TODO: Can be problem if the args is TypeParameter from some parent (eg. passing TypeParameter of class to some type of property)
		.map(typeArg => getTypeId(typeArg, typeChecker)) || [];

	// It has no type arguments and it is native type
	if (typeArguments.length === 0 && sourceFileId === ModuleIds.Native)
	{
		const nativeRef = getComplexNativeTypeProperties(symbol);

		if (nativeRef !== undefined)
		{
			// Store the Reference on the type. Performance optimization.
			setReflectedTypeReference(type, nativeRef);

			return nativeRef;
		}

		log.warn("Unhandled complex native type.", printTypeDebugInfo(type, typeChecker));

		// Store the Unknown reference on the type. Otherwise it can cause issue because of native recursive types.
		setReflectedTypeReference(type, TransformerTypeReference.Unknown);

		return TransformerTypeReference.Unknown;
	}

	const ref = new TransformerTypeReference(
		sourceFileId,
		symbol.escapedName.toString(),
		undefined,
		typeArguments,
		sourceFile
	);

	// Store the Reference on the type.
	setReflectedTypeReference(type, ref);

	return ref;
}

const nodeModulesPattern = "/node_modules/";

// TODO: Move somewhere, with getTypeId
export function getSourceFileId(sourceFile: ts.SourceFile): ModuleIdentifier
{
	if (isReflectedSourceFile(sourceFile))
	{
		return sourceFile._reflectId;
	}

	const { packageInfo, projectDir } = TransformerContext.instance.config;
	const isExternal = TransformerContext.instance.program.isSourceFileFromExternalLibrary(sourceFile);

	if (isExternal)
	{
		const dependencyInfo = TransformerContext.instance.dependencyManager.getDependencyInfo(sourceFile.fileName);

		if (dependencyInfo !== undefined)
		{
			const sourceFileId = "@" + dependencyInfo.packageName + sourceFile.fileName.slice(dependencyInfo.packageRoot.length);
			setSourceFileReflectId(sourceFile, sourceFileId);
			return sourceFileId;
		}
	}

	if (sourceFile.fileName.includes("/node_modules/typescript/lib/lib."))
	{
		return ModuleIds.Native;
	}

	const filePath = getOutPathForSourceFile(sourceFile.fileName);
	const nodeModulesIndex = filePath.lastIndexOf(nodeModulesPattern);

	const sourceFileId = nodeModulesIndex != -1
		? "@" + filePath.slice(nodeModulesIndex + nodeModulesPattern.length)
		: "@" + packageInfo.name + "/" + path.relative(projectDir, filePath).replace(PATH_SEPARATOR_REGEX, "/");

	setSourceFileReflectId(sourceFile, sourceFileId);

	return sourceFileId;
}

export function getOutPathForSourceFile(sourceFileName: string): string
{
	const config = TransformerContext.instance.config;

	return ts.getOutputFileNames({
		fileNames: [sourceFileName],
		options: config.compilerOptions,
		errors: []
	}, sourceFileName, false)[0];
}

export function hasReflectedTypeReference(type: ts.Type): type is ReflectedTypeWithReference
{
	return (type as ReflectedTypeWithReference)._typeReference !== undefined;
}

function setReflectedTypeReference(type: ts.Type, ref: TransformerTypeReference): ReflectedTypeWithReference
{
	(type as ReflectedTypeWithReference)._typeReference = ref;
	return type as ReflectedTypeWithReference;
}

export function isReflectedSourceFile(type: ts.SourceFile): type is ReflectedSourceFileWithIdentifier // TODO: Rename as the Type equiv.
{
	return (type as ReflectedSourceFileWithIdentifier)._reflectId !== undefined;
}

function setSourceFileReflectId(sourceFile: ts.SourceFile, reflectId: string): ReflectedSourceFileWithIdentifier
{
	(sourceFile as ReflectedSourceFileWithIdentifier)._reflectId = reflectId;
	return sourceFile as ReflectedSourceFileWithIdentifier;
}