import { TypeKind }                from "@rttist/abstract";
import * as ts                     from "typescript";
import { Context }                 from "../../contexts/Context";
import { printTypeDebugInfo }      from "../../debugs/printTypeDebugInfo";
import {
	TypeMapper,
	TypeMapperResult
}                                  from "../../declarations/mappers";
import {
	ClassProperties,
	InterfaceProperties
}                                  from "../../declarations/TypeProperties";
import {
	getClassModifiers,
	getHeritageClauses
}                                  from "../../utils/declarationHelpers";
import { isExported }              from "../../utils/isExported";
import { getDeclaration }          from "../../utils/symbolHelpers";
import {
	getSymbol,
	getTypeId,
	isReference
}                                  from "../../utils/typeHelpers";
import { getConstructors }         from "../getConstructors";
import { getDecoratorsProperties } from "../getDecoratorsProperties";
import { getMethods }              from "../getMethods";
import { getProperties }           from "../getProperties";
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
		?.map(typeArg => context.metadata.referenceType(typeArg, undefined, context));

	if (typeArguments === undefined || typeArguments.length === 0)
	{
		typeArguments = undefined;
	}

	return typeArguments;
}

export function mapObject(type: ts.ObjectType/*, typeNode: ts.TypeNode| undefined*/, context: Context): TypeMapperResult
{
	const mapper = ObjectFlagsMappers[type.objectFlags];

	if (mapper)
	{
		const mapperResult = mapper(type, context);

		if (mapperResult)
		{
			return mapperResult;
		}

		// context.log.warn("Unhandled type. " + printTypeDebugInfo(type, context.typeChecker));
	}

	const symbol = getSymbol(type, context.typeChecker);

	// Resolve correct type in case of reference. But the reference holds the type arguments.
	const resolvedType = isReference(type) ? type.target : type;

	if ((resolvedType.objectFlags & ts.ObjectFlags.Class) !== 0 || (resolvedType.objectFlags & ts.ObjectFlags.Interface) !== 0)
	{
		const kind = (resolvedType.objectFlags & ts.ObjectFlags.Class) !== 0
			? TypeKind.Class
			: TypeKind.Interface;

		const declaration = getDeclaration(symbol);
		const typeArguments = getTypeArgumentsReference(type, context);

		const properties: ClassProperties & InterfaceProperties = {
			id: getTypeId(type, context.typeChecker),
			kind: kind,
			name: symbol?.getEscapedName().toString() ?? "",
			typeArguments: typeArguments,
			isGenericTypeDefinition: typeArguments !== undefined && resolvedType == type ? true : undefined
		};

		if (type !== resolvedType)
		{
			properties.genericTypeDefinition = context.metadata.referenceType(resolvedType, undefined, context);

			// If it is generic type with generic type definition, 
			// we will not serialize whole type again an again for all the variants. 
			// All the types will be the same, just generic parameters will differ.
			// This can be handled in runtime part.
			return properties;
		}

		properties.properties = getProperties(type, context);
		properties.methods = getMethods(type, context);

		if (kind === TypeKind.Class)
		{
			properties.constructors = getConstructors(type, context);
			properties.ctor = undefined; // TODO: Create ImportDetails and let middlewares to generate imports or generate import right here?? But Imports must be generated somewhere to support lazy loadings of webpack etc.
			properties.ctorSync = undefined;
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