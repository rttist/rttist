import * as ts                        from "typescript";
import path                           from "path";
import {
	ModuleIdentifier,
	TypeIdentifier
} from "@rttist/abstract";
import { TypeIds }                    from "@rttist/core";
import { Context }                    from "../contexts/Context";
import { TransformerContext }         from "../contexts/TransformerContext";
import { printTypeDebugInfo }         from "../debugs/printTypeDebugInfo";
import {
	ReflectedSourceFile,
	ReflectedTypeWithIdentifier,
	TransformerTypeReference
}                                     from "../declarations/general";
import { PATH_SEPARATOR_REGEX }       from "../helpers";
import { log }                        from "../log";
import { getPrimitiveTypeProperties } from "../properties/getPrimitiveTypeProperties";
import { getDeclaration }             from "./symbolHelpers";

/**
 * If the given type is some kind of alias or something which we don't want to reflect, find the right type.
 * @param type
 */
export function resolveType(type: ts.Type): ts.Type
{
	// TODO: Implement; maybe the logic replacing true | false union for boolean etc.
	return type;
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

/**
 * Check if the type is an Array
 * @param type
 */
export function isArrayType(type: ts.Type): boolean
{
	// [Hookyns] Check if type is Array. I found no direct way to do so.
	return !!(type.flags & ts.TypeFlags.Object) && type.symbol?.escapedName === "Array"; // TODO: Check ObjectFlags && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.ArrayLiteral && ??
}

export function getTypeId(type: ts.Type, context: Context): TypeIdentifier
{
	const ref = getTypeRef(type, context.typeChecker);

	if (typeof ref === "string")
	{
		return ref;
	}

	context.log.error("getTypeId called for type which cannot have ID. TransformerReference of the type:", ref);
	return TypeIds.Invalid;
}

/**
 * Returns id of given type
 * @param type
 * @param typeChecker
 */
export function getTypeRef(type: ts.Type, typeChecker: ts.TypeChecker): TransformerTypeReference
{
	if (hasReflectId(type))
	{
		return type._reflectId;
	}

	// TODO: Remove after tests
	const x = type.symbol && typeChecker.getRootSymbols(type.symbol);
	// const y = type.symbol && typeChecker.getFullyQualifiedName(type.symbol); // It's eg.: `"D:/packages/tst-reflect/dev/quick-tests/SomeType".SomeType`
	if (x?.length && x[0] != type.symbol)
	{
		debugger;
	}

	const symbol = getSymbol(type, typeChecker);
	const declaration = getDeclaration(symbol);

	if (!declaration || !symbol)
	{
		const primitiveTypeProperties = getPrimitiveTypeProperties(type);

		if (primitiveTypeProperties !== undefined)
		{
			return primitiveTypeProperties;
		}

		log.warn("Unable to generate Id for type without declaration.", printTypeDebugInfo(type, typeChecker));

		return TypeIds.Unknown;
	}

	const sourceFileId = getSourceFileId(declaration.getSourceFile());

	// TODO: Is it ok?
	const typeId = sourceFileId + "::" + symbol.escapedName;

	setTypeReflectId(type, typeId);

	return typeId;

	// ts.getNameOfDeclaration()
	// context.typeChecker.getSymbolAtLocation()
	// context.typeChecker.getDeclaredTypeOfSymbol(declaration)

	// return filePath + ":" + symbol.getName();
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
	// TransformerContext.instance.config.compilerOptions.
	// if (!context.config.parsedCommandLine.fileNames.includes(sourceFileName))
	// {
	// 	context.config.parsedCommandLine.fileNames.push(sourceFileName);
	// }

	const config = TransformerContext.instance.config;

	return ts.getOutputFileNames({
		fileNames: [sourceFileName],
		options: config.compilerOptions,
		errors: []
	}, sourceFileName, false)[0];
	//.filter(fn => fn.slice(-3) == ".js" || fn.slice(-4) == ".jsx" || fn.slice(-5) == ".d.ts")[0];
	// }

	// // Get the actual file location, regardless of dist/source dir
	// // This should leave us with:
	// // /ctor-reflection/SomeServiceClass.ts
	// let outPath = sourceFileName.replace(context.config.rootDir, "");
	//
	// // If we have a slash at the start, it has to go
	// // Now we have:
	// // ctor-reflection/SomeServiceClass.ts
	// if (outPath.startsWith("/"))
	// {
	// 	outPath = outPath.slice(1);
	// }
	//
	// // Now we can take the build path, from the tsconfig file and combine it
	// // This should give us:
	// // /Users/sam/Code/Packages/ts-reflection/dev/testing/dist/method-reflection/index.ts
	// outPath = path.join(context.config.outDir, outPath);
	//
	// return replaceExtension(outPath, ".js");
}

export function hasReflectId(type: ts.Type): type is ReflectedTypeWithIdentifier
{
	return (type as ReflectedTypeWithIdentifier)._reflectId !== undefined;
}

function setTypeReflectId(type: ts.Type, reflectId: string): ReflectedTypeWithIdentifier
{
	(type as ReflectedTypeWithIdentifier)._reflectId = reflectId;
	return type as ReflectedTypeWithIdentifier;
}

export function isReflectedSourceFile(type: ts.SourceFile): type is ReflectedSourceFile
{
	return (type as ReflectedSourceFile)._reflectId !== undefined;
}

function setSourceFileReflectId(sourceFile: ts.SourceFile, reflectId: string): ReflectedSourceFile
{
	(sourceFile as ReflectedSourceFile)._reflectId = reflectId;
	return sourceFile as ReflectedSourceFile;
}


// /**
//  * Get full name of the type
//  * @param type
//  * @param context
//  */
// export function getTypeFullName(type: ts.Type, context: Context)
// {
// 	let { packageName, projectDir } = TransformerContext.instance.config;
// 	const symbol = getSymbol(type, context);
//
// 	if (symbol === undefined)
// 	{
// 		context.log.error("Symbol of type not found. Unable to generate 'fullName'.");
// 		return "{{invalid}}";
// 	}
//
// 	let filePath = getSourceFile(symbol)?.fileName;
//
// 	if (filePath === undefined)
// 	{
// 		context.log.error(`SourceFile of symbol '${symbol.escapedName}' not found. Unable to generate 'fullName'.`);
// 		return "{{invalid}}";
// 	}
//
// 	const nodeModulesIndex = filePath.lastIndexOf(nodeModulesPattern);
//
// 	if (nodeModulesIndex != -1)
// 	{
// 		filePath = filePath.slice(nodeModulesIndex + nodeModulesPattern.length);
// 	}
// 	else if (projectDir)
// 	{
// 		filePath = packageName + "/" + path.relative(projectDir, filePath).replace(PATH_SEPARATOR_REGEX, "/");
// 	}
//
// 	// ts.getNameOfDeclaration()
// 	// context.typeChecker.getSymbolAtLocation()
// 	// context.typeChecker.getDeclaredTypeOfSymbol(declaration)
//
// 	return filePath + ":" + symbol.getName();
// }