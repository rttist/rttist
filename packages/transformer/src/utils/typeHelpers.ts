import {
	ModuleIdentifier,
	TypeIdentifier
}                               from "@rtti/abstract";
import path                     from "path";
import * as ts                  from "typescript";
import { NativeTypeIdPrefix }   from "../consts";
import { Context }              from "../contexts/Context";
import { TransformerContext }   from "../contexts/TransformerContext";
import { PATH_SEPARATOR_REGEX } from "../helpers";
import { getDeclaration }       from "./symbolHelpers";

export function getSymbol(type: ts.Type, context: Context): ts.Symbol | undefined
{
	if (type.symbol === undefined)
	{
		return undefined;
	}

	if ((type.symbol.flags & ts.SymbolFlags.Alias) !== 0)
	{
		return context.typeChecker.getAliasedSymbol(type.symbol);
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
 */
export function getTypeId(type: ts.Type): TypeIdentifier
{
	const declaration = getDeclaration(type.symbol);

	if (!declaration)
	{
		// TODO: Handle this state! This occur for every native type (string, number etc.)
		return NativeTypeIdPrefix + (type as any)["intrinsicName"];
	}

	const sourceFileId = getSourceFileId(declaration.getSourceFile());

	// TODO: Is it ok?
	return sourceFileId + "::" + type.symbol.escapedName;

	// ts.getNameOfDeclaration()
	// context.typeChecker.getSymbolAtLocation()
	// context.typeChecker.getDeclaredTypeOfSymbol(declaration)

	// return filePath + ":" + symbol.getName();
}


const nodeModulesPattern = "/node_modules/";

// TODO: Move somewhere, with getTypeId
export function getSourceFileId(sourceFile: ts.SourceFile): ModuleIdentifier
{
	const { packageName, projectDir } = TransformerContext.instance.config;

	let filePath = sourceFile.fileName;
	const nodeModulesIndex = sourceFile.fileName.lastIndexOf(nodeModulesPattern);

	if (nodeModulesIndex != -1)
	{
		filePath = "@" + filePath.slice(nodeModulesIndex + nodeModulesPattern.length);
	}
	else if (projectDir)
	{
		filePath = "@" + packageName + "/" + path.relative(projectDir, filePath).replace(PATH_SEPARATOR_REGEX, "/");
	}

	return filePath;
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