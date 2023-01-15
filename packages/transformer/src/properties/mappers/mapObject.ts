import {
	PropertyFlags,
	TypeKind
}                                  from "rttist";
import { ModuleIds }               from "@rttist/core";
import * as ts                     from "typescript";
import { Context }                 from "../../contexts/Context";
import {
	TypeMapper,
	TypeMapperResult
}                                  from "../../declarations/mappers";
import {
	ClassProperties,
	InterfaceProperties
}                                  from "../../declarations/TypeProperties";
import { printTypeDebugInfo }      from "../../tracers/printTypeDebugInfo";
import {
	getClassModifiers,
	getHeritageClauses
}                                  from "../../utils/declarationHelpers";
import { getTypeRef }              from "../../utils/getTypeRef";
import { isExported }              from "../../utils/isExported";
import { getDeclaration }          from "../../utils/symbolHelpers";
import {
	getSymbol,
	isReference
}                                  from "../../utils/typeHelpers";
import { getConstructors }         from "../getConstructors";
import { getDecoratorsProperties } from "../getDecoratorsProperties";
import { mapIndexes }              from "../mapIndexes";
import { mapMethods }              from "../mapMethods";
import { mapProperties }           from "../mapProperties";
import { mapFunction }             from "./mapFunction";
import { mapObjectLiteral }        from "./mapObjectLiteral";
import { mapTuple }                from "./mapTuple";

const ObjectFlagsMappers: { [typeFlag: number]: TypeMapper } = {
	[ts.ObjectFlags.Tuple]: mapTuple as TypeMapper,
	[ts.ObjectFlags.ObjectLiteral]: mapObjectLiteral as TypeMapper,
	[ts.ObjectFlags.Anonymous]: mapObjectLiteral as TypeMapper,
};

// TODO: Move
function getTypeArgumentsReference(type: ts.ObjectType, context: Context)
{
	let typeArguments = (type as ts.TypeReference).typeArguments
		?.map(typeArg => context.metadata.referenceType(typeArg, false, undefined, undefined, context));

	if (typeArguments === undefined || typeArguments.length === 0)
	{
		typeArguments = undefined;
	}

	return typeArguments;
}

export function mapObject(type: ts.ObjectType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	// Anonymous object, functions, ...
	if (type.objectFlags & ts.ObjectFlags.Anonymous)
	{
		if ((type.symbol.flags & ts.SymbolFlags.Function) !== 0)
		{
			return mapFunction(type, symbol, context);
		}
	}

	const mapper = ObjectFlagsMappers[type.objectFlags];

	if (mapper)
	{
		const mapperResult = mapper(type, symbol, context);

		if (mapperResult)
		{
			return mapperResult;
		}

		// context.log.warn("Unhandled type. " + printTypeDebugInfo(type, context.typeChecker));
	}

	symbol = symbol ?? getSymbol(type, context.typeChecker);

	// Resolve correct type in case of reference. But the reference holds the type arguments.
	const resolvedType = isReference(type) ? type.target : type;

	if ((resolvedType.objectFlags & ts.ObjectFlags.Class) !== 0 || (resolvedType.objectFlags & ts.ObjectFlags.Interface) !== 0)
	{
		const kind = (resolvedType.objectFlags & ts.ObjectFlags.Class) !== 0
			? TypeKind.Class
			: TypeKind.Interface;

		const declaration = getDeclaration(symbol);
		const typeArguments = getTypeArgumentsReference(type, context);
		const typeRef = getTypeRef(type, false, symbol, context.typeChecker); // TODO: This is used just to check it is native; is it OK? (perf)

		const properties: ClassProperties & InterfaceProperties = {
			kind: kind,
			name: symbol?.getEscapedName().toString() ?? "",
			typeArguments: typeArguments,
			isGenericTypeDefinition: typeArguments !== undefined && resolvedType == type ? true : undefined
		} as any;

		if (type !== resolvedType)
		{
			properties.genericTypeDefinition = context.metadata.referenceType(
				resolvedType,
				false,
				undefined,
				undefined,
				context
			);

			// If it is generic type with generic type definition, 
			// we will not serialize whole type again an again for all the variants. 
			// All the types will be the same, just generic parameters will differ.
			// This can be handled in runtime part.
			return properties;
		}

		if (typeRef.moduleIdentifier === ModuleIds.Native)
		{
			return properties;
		}

		const members = type.getProperties();
		properties.properties = mapProperties(members, context);
		properties.methods = mapMethods(members, context);
		properties.indexes = mapIndexes(type, context);

		if (kind === TypeKind.Class)
		{
			properties.constructors = getConstructors(
				declaration
					? context.typeChecker.getTypeOfSymbolAtLocation(type.symbol, declaration)
					: type,
				context
			);

			// TODO: Remove?! There is an "import" on Module, so types can be imported that way. - module.import().then(m => m[module.getTypes().filter(t => t.exported)[0].name]
			properties.ctor = undefined; // TODO: Create ImportDetails and let middlewares to generate imports or generate import right here?? But Imports must be generated somewhere to support lazy loadings of webpack etc.
			properties.ctorSync = undefined;

			const staticMembers = Array.from<ts.Symbol>(symbol?.exports?.values() || [] as any)
				.filter(member => member.escapedName !== "prototype");

			if (staticMembers !== undefined)
			{
				properties.properties = properties.properties.concat(
					mapProperties(staticMembers, context).map(prop => {
						prop.flags |= PropertyFlags.Static;
						return prop;
					})
				);

				properties.methods = properties.methods.concat(
					mapMethods(staticMembers, context).map(prop => {
						prop.flags |= PropertyFlags.Static;
						return prop;
					})
				);
			}

			if (properties.properties.length === 0)
			{
				properties.properties = undefined;
			}

			if (properties.methods.length === 0)
			{
				properties.methods = undefined;
			}
		}

		if (declaration)
		{
			const heritageClauses = getHeritageClauses(
				declaration as ts.ClassLikeDeclarationBase | ts.InterfaceDeclaration,
				context
			);

			if (kind === TypeKind.Class)
			{
				(properties as ClassProperties).extends = heritageClauses.extends?.[0];
				(properties as ClassProperties).implements = heritageClauses.implements;
				(properties as ClassProperties).decorators = getDecoratorsProperties(declaration, context);

				const modifiers = getClassModifiers(declaration as ts.ClassLikeDeclaration);
				(properties as ClassProperties).abstract = modifiers.abstract;
			}
			else
			{
				(properties as InterfaceProperties).extends = heritageClauses.extends;
			}

			if (isExported(declaration))
			{
				properties.exported = true;
			}
		}

		return properties;
	}

	if (type.aliasSymbol && type.aliasTypeArguments)
	{
		// type.mapper
	}

	switch (type.objectFlags)
	{
		// case ts.ObjectFlags.Reference:
		// 	break;

		case ts.ObjectFlags.JsxAttributes:
			break;

		case ts.ObjectFlags.ArrayLiteral:
			break;
	}

	context.log.warn("Unhandled type. " + printTypeDebugInfo(resolvedType, context.typeChecker));

	return undefined;

	// return {
	// 	properties: {
	// 		k: TypeKind.UniqueSymbol,
	// 		n: type.escapedName?.toString()
	// 	},
	// 	localType: false
	// };
}