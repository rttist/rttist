import * as ts                        from "typescript";
import { UnknownTypeProperties }      from "../consts";
import { Context }                    from "../contexts/Context";
import { TypeMapper }                 from "../declarations/mappers";
import { TypeProperties }             from "../declarations/TypeProperties";
import { log }                        from "../log";
import { getTypeSourceLocationText }  from "../utils/traceHelpers";
import { getLiteralProperties }       from "./getLiteralProperties";
import { getPrimitiveTypeProperties } from "./getPrimitiveTypeProperties";
import { mapConditional }             from "./mappers/mapConditional";
import { mapEnum }                    from "./mappers/mapEnum";
import { mapEnumLiteral }             from "./mappers/mapEnumLiteral";
import { mapESSymbol }                from "./mappers/mapESSymbol";
import { mapIndex }                   from "./mappers/mapIndex";
import { mapIndexedAccessType }       from "./mappers/mapIndexedAccessType";
import { mapIntersection }            from "./mappers/mapIntersection";
import { mapObject }                  from "./mappers/mapObject";
import { mapTemplateLiteral }         from "./mappers/mapTemplateLiteral";
import { mapTypeParameter }           from "./mappers/mapTypeParameter";
import { mapUnion }                   from "./mappers/mapUnion";
import { mapUniqueEESymbol }          from "./mappers/mapUniqueEESymbol";

const TypeFlagsMappers: { [typeFlag: number]: TypeMapper } = {
	[ts.TypeFlags.Enum]: mapEnum,
	[ts.TypeFlags.EnumLiteral]: mapEnumLiteral as TypeMapper,
	[ts.TypeFlags.ESSymbol]: mapESSymbol,
	[ts.TypeFlags.UniqueESSymbol]: mapUniqueEESymbol as TypeMapper,
	[ts.TypeFlags.TypeParameter]: mapTypeParameter,
	[ts.TypeFlags.Object]: mapObject as TypeMapper,
	[ts.TypeFlags.Union]: mapUnion as TypeMapper,
	[ts.TypeFlags.Intersection]: mapIntersection as TypeMapper,
	[ts.TypeFlags.Index]: mapIndex as TypeMapper,
	[ts.TypeFlags.IndexedAccess]: mapIndexedAccessType as TypeMapper,
	[ts.TypeFlags.Conditional]: mapConditional as TypeMapper,
	[ts.TypeFlags.TemplateLiteral]: mapTemplateLiteral as TypeMapper,
};


/**
 * Return TypeProperties object describing given type.
 * @param type
 * @param context
 */
export function getTypeProperties(type: ts.Type, context: Context): TypeProperties
{
	if (context.config.debugMode)
	{
		log.trace(getTypeSourceLocationText(type, context));
	}

	const primitiveTypeProperties = getPrimitiveTypeProperties(type, context);

	if (primitiveTypeProperties !== undefined)
	{
		return primitiveTypeProperties;
	}

	if (type.isLiteral())
	{
		const literalDescriptionResult = getLiteralProperties(type, context);

		if (literalDescriptionResult !== undefined)
		{
			return literalDescriptionResult;
		}

		context.log.warn("Unhandled Literal type (flags: " + type.flags + ").\r\n\t" + getTypeSourceLocationText(type, context));
		return UnknownTypeProperties;
	}

	const mapper = TypeFlagsMappers[type.flags];

	if (mapper === undefined)
	{
		context.log.warn("No mapper found for the types with flags " + type.flags + ".\r\n\t" + getTypeSourceLocationText(type, context));
		return UnknownTypeProperties;
	}

	const mapperResult = mapper(type, context);

	if (mapperResult)
	{
		return mapperResult;
	}

	context.log.debug(`Mapper '${mapper.name}' returned invalid result for type with flags ${type.flags}.\r\n\t` + getTypeSourceLocationText(type, context));

	return UnknownTypeProperties;
}