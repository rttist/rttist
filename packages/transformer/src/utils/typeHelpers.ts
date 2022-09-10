import {
	ModuleIdentifier,
	TypeIdentifier
}                               from "@rtti/abstract";
import path                     from "path";
import * as ts                  from "typescript";
import {
	NativeTypeIdPrefix,
	UnknownTypeIdentifier
}                                     from "../consts";
import { TransformerContext }         from "../contexts/TransformerContext";
import {
	ReflectedType,
	TransformerTypeReference
}                                     from "../declarations/general";
import { PATH_SEPARATOR_REGEX }       from "../helpers";
import { log }                        from "../log";
import { getPrimitiveTypeProperties } from "../properties/getPrimitiveTypeProperties";
import { getDeclaration }             from "./symbolHelpers";

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

/**
 * Returns id of given type
 * @param type
 * @param typeChecker
 */
export function getTypeRef(type: ts.Type, typeChecker: ts.TypeChecker): TransformerTypeReference
{
	if (isReflectedType(type))
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

	const declaration = getDeclaration(type.symbol);

	if (!declaration)
	{
		const primitiveTypeProperties = getPrimitiveTypeProperties(type);

		if (primitiveTypeProperties !== undefined)
		{
			return primitiveTypeProperties;
		}

		log.warn("Unable to generate Id for type without declaration.", getTypeDebugLogInfo(type, typeChecker));

		return UnknownTypeIdentifier;
	}

	const sourceFileId = getSourceFileId(declaration.getSourceFile());

	// TODO: Is it ok?
	const typeId = sourceFileId + "::" + type.symbol.escapedName;

	setReflectId(type, typeId);

	return typeId;

	// ts.getNameOfDeclaration()
	// context.typeChecker.getSymbolAtLocation()
	// context.typeChecker.getDeclaredTypeOfSymbol(declaration)

	// return filePath + ":" + symbol.getName();
}

export function getTypeDebugLogInfo(type: ts.Type, typeChecker: ts.TypeChecker): string
{
	const symbol = getSymbol(type, typeChecker);
	const symbolInfo = symbol ? `flags: ${symbol.flags}, name: '${symbol.escapedName}'.` : "is undefined.";
	return `Type flags: ${type.flags}; symbol ${symbolInfo}`;
}

const nodeModulesPattern = "/node_modules/";

// TODO: Move somewhere, with getTypeId
export function getSourceFileId(sourceFile: ts.SourceFile): ModuleIdentifier
{
	const { packageName, projectDir } = TransformerContext.instance.config;

	// TODO: Solve externals; Will we even get here?
	// TransformerContext.instance.program.isSourceFileFromExternalLibrary()

	let filePath = getOutPathForSourceFile(sourceFile.fileName);

	const nodeModulesIndex = sourceFile.fileName.lastIndexOf(nodeModulesPattern);

	if (nodeModulesIndex != -1)
	{
		// TODO: Load all dependencies from package.json and store info there in TransformerContext at init. Then we should just try to match 
		filePath = "@" + filePath.slice(nodeModulesIndex + nodeModulesPattern.length);
	}
	else if (projectDir)
	{
		filePath = "@" + packageName + "/" + path.relative(projectDir, filePath).replace(PATH_SEPARATOR_REGEX, "/");
	}

	return filePath;
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

export function isReflectedType(type: ts.Type): type is ReflectedType
{
	return (type as ReflectedType)._reflectId !== undefined;
}

function setReflectId(type: ts.Type, reflectId: string): ReflectedType
{
	(type as ReflectedType)._reflectId = reflectId;
	return type as ReflectedType;
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