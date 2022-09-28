import * as ts from "typescript";
import { UnknownTypeProperties } from "../consts";
import { Context } from "../contexts/Context";
import { printTypeDebugInfo } from "../debugs/printTypeDebugInfo";
import { TypeMapper } from "../declarations/mappers";
import { TypeProperties } from "../declarations/TypeProperties";
import { getLiteralProperties } from "./getLiteralProperties";
import { mapConditional } from "./mappers/mapConditional";
import { mapEnum } from "./mappers/mapEnum";
import { mapEnumLiteral } from "./mappers/mapEnumLiteral";
import { mapESSymbol } from "./mappers/mapESSymbol";
import { mapIndex } from "./mappers/mapIndex";
import { mapIndexedAccessType } from "./mappers/mapIndexedAccessType";
import { mapIntersection } from "./mappers/mapIntersection";
import { mapObject } from "./mappers/mapObject";
import { mapStringMapping } from "./mappers/mapStringMapping";
import { mapTemplateLiteral } from "./mappers/mapTemplateLiteral";
import { mapTypeParameter } from "./mappers/mapTypeParameter";
import { mapUnion } from "./mappers/mapUnion";
import { mapUniqueEESymbol } from "./mappers/mapUniqueEESymbol";

const TypeFlagsMappers: { [typeFlag: number]: TypeMapper } = {
	[ts.TypeFlags.Enum]: mapEnum,
	[ts.TypeFlags.EnumLiteral]: mapEnumLiteral as TypeMapper,
	[ts.TypeFlags.ESSymbol]: mapESSymbol, // TODO: Isn't it native?
	[ts.TypeFlags.UniqueESSymbol]: mapUniqueEESymbol as TypeMapper, // TODO: Isn't it native?
	[ts.TypeFlags.TypeParameter]: mapTypeParameter,
	[ts.TypeFlags.Object]: mapObject as TypeMapper,
	[ts.TypeFlags.Union]: mapUnion as TypeMapper,
	[ts.TypeFlags.Intersection]: mapIntersection as TypeMapper,
	[ts.TypeFlags.Index]: mapIndex as TypeMapper,
	[ts.TypeFlags.IndexedAccess]: mapIndexedAccessType as TypeMapper,
	[ts.TypeFlags.Conditional]: mapConditional as TypeMapper,
	[ts.TypeFlags.TemplateLiteral]: mapTemplateLiteral as TypeMapper,
	[ts.TypeFlags.StringMapping]: mapStringMapping as TypeMapper,
};


/**
 * Return TypeProperties object describing given type.
 * @param type
 * @param context
 */
export function getTypeProperties(type: ts.Type, context: Context): TypeProperties
{
	// 	log.trace(getTypeSourceLocationText(type, context));

	// It's gonna never be primitive type, cuz they are handled by getTypeRef()
	// const primitiveTypeProperties = getPrimitiveTypeProperties(type, context);
	//
	// 	if (primitiveTypeProperties !== undefined)
	// 	{
	// 		return primitiveTypeProperties;
	// 	}

	if (type.isLiteral())
	{
		const literalDescriptionResult = getLiteralProperties(type, context);

		if (literalDescriptionResult !== undefined)
		{
			return literalDescriptionResult;
		}

		context.log.warn("Unhandled Literal type.\n\t" + printTypeDebugInfo(type, context.typeChecker));
		return UnknownTypeProperties;
	}

	const mapper = TypeFlagsMappers[type.flags];

	if (mapper === undefined)
	{
		context.log.warn("No mapper found for the type.\n\t" + printTypeDebugInfo(type, context.typeChecker));
		return UnknownTypeProperties;
	}

	const mapperResult = mapper(type, context);

	if (mapperResult)
	{
		return mapperResult;
	}

	context.log.debug(`Mapper '${mapper.name}' returned invalid result.\n\t` + printTypeDebugInfo(
		type,
		context.typeChecker
	));

	return UnknownTypeProperties;
}