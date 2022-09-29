import * as ts            from "typescript";
import { TypeIds }        from "@rttist/core";
import { TypeIdentifier } from "@rttist/abstract";
import { getTypeRef }     from "./getTypeRef";

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

/**
 * @desc If the type is a reference, it is usually a sub type of generic type definition.
 * @param type
 */
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
	const symbol = ((type.aliasSymbol?.flags || 0) & ts.SymbolFlags.TypeAlias) !== 0
		? type.aliasSymbol
		: type.symbol;

	if (symbol === undefined)
	{
		return undefined;
	}

	// TODO: What is alias? It's not TypeAlias. Do we want to follow aliases?
	if ((symbol.flags & ts.SymbolFlags.Alias) !== 0)
	{
		return typeChecker.getAliasedSymbol(symbol);
	}

	return symbol;
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

export function getTypeId(type: ts.Type, symbol: ts.Symbol | undefined, typeChecker: ts.TypeChecker): TypeIdentifier
{
	return getTypeRef(type, symbol, typeChecker).id || TypeIds.Invalid;
}

export function isInvalidType(type: ts.Type | undefined): boolean
{
	return type === undefined || (type as any).intrinsicName === "error";
}