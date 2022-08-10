import path                   from "path";
import * as ts                from "typescript";
import { Context }            from "../contexts/Context";
import { TransformerContext } from "../contexts/TransformerContext";
import {
	PATH_SEPARATOR_REGEX
}                             from "../helpers";
import {
	getDeclaration,
	getSourceFile
} from "./symbolHelpers";

export function getSymbol(type: ts.Type, context: Context): ts.Symbol
{
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
	return !!(type.flags & ts.TypeFlags.Object) && type.symbol?.escapedName == "Array"; // TODO: Check ObjectFlags && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.ArrayLiteral && ??
}

let typeIdCounter = -1;

/**
 * Returns id of given type
 * @param type
 */
export function getTypeId(type: ts.Type): number
{
	return (type as any).id ?? (type as any).__reflectId ?? ((type as any).__reflectId = typeIdCounter--);
}


const nodeModulesPattern = "/node_modules/";

/**
 * Get full name of the type
 * @param type
 * @param context
 */
export function getTypeFullName(type: ts.Type, context: Context)
{
	let { packageName, rootDir } = TransformerContext.instance.config;
	const symbol = getSymbol(type, context);
	let filePath = getSourceFile(symbol).fileName;
	const nodeModulesIndex = filePath.lastIndexOf(nodeModulesPattern);

	if (nodeModulesIndex != -1)
	{
		filePath = filePath.slice(nodeModulesIndex + nodeModulesPattern.length);
	}
	else if (rootDir)
	{
		filePath = packageName + "/" + path.relative(rootDir, filePath).replace(PATH_SEPARATOR_REGEX, "/");
	}

	// ts.getNameOfDeclaration()
	// context.typeChecker.getSymbolAtLocation()
	// context.typeChecker.getDeclaredTypeOfSymbol(declaration)

	return filePath + ":" + symbol.getName() + "#" + getTypeId(type); // TODO: Check if type can be used in getTypeId(); references, aliases? It must be Id of final type.
}