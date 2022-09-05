import {
	ModuleIdentifier,
	TypeIdentifier
}                               from "@rtti/abstract";
import path                     from "path";
import * as ts                  from "typescript";
import { Context }              from "../contexts/Context";
import { TransformerContext }   from "../contexts/TransformerContext";
import { PATH_SEPARATOR_REGEX } from "../helpers";
import {
	getDeclaration,
	getSourceFile
}                               from "./symbolHelpers";

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
	
	if (!declaration) {
		// TODO: Handle this state! This occur for every native type (string, number etc.)
		return "";
	}

	const sourceFileId = getSourceFileId(declaration.getSourceFile());
	
	// TODO: Handle this properly.
	return sourceFileId + "::" + type.symbol.escapedName;
}

// TODO: Move somewhere, with getTypeId
export function getSourceFileId(sourceFile: ts.SourceFile): ModuleIdentifier
{
	// TODO: Detect root of the package where the type is and use name of the package as root.
	//  Cache generated SourceFile id on the SourceFile.
	
	return sourceFile.fileName;
}


const nodeModulesPattern = "/node_modules/";

/**
 * Get full name of the type
 * @param type
 * @param context
 */
export function getTypeFullName(type: ts.Type, context: Context)
{
	let { packageName, projectDir } = TransformerContext.instance.config;
	const symbol = getSymbol(type, context);

	if (symbol === undefined)
	{
		context.log.error("Symbol of type not found. Unable to generate 'fullName'.");
		return "{{invalid}}";
	}

	let filePath = getSourceFile(symbol)?.fileName;

	if (filePath === undefined)
	{
		context.log.error(`SourceFile of symbol '${symbol.escapedName}' not found. Unable to generate 'fullName'.`);
		return "{{invalid}}";
	}

	const nodeModulesIndex = filePath.lastIndexOf(nodeModulesPattern);

	if (nodeModulesIndex != -1)
	{
		filePath = filePath.slice(nodeModulesIndex + nodeModulesPattern.length);
	}
	else if (projectDir)
	{
		filePath = packageName + "/" + path.relative(projectDir, filePath).replace(PATH_SEPARATOR_REGEX, "/");
	}

	// ts.getNameOfDeclaration()
	// context.typeChecker.getSymbolAtLocation()
	// context.typeChecker.getDeclaredTypeOfSymbol(declaration)

	return filePath + ":" + symbol.getName() + "#" + getTypeId(type); // TODO: Check if type can be used in getTypeId(); references, aliases? It must be Id of final type.
}