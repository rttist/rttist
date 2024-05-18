import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeMapper } from "../../../declarations/mappers";
import { TypeAliasProperties, TypeProperties } from "../../../declarations/type-properties";
import { InvalidTypeProperties } from "../consts";
import { Context } from "../contexts/context";
import { printTypeDebugInfo } from "../tracers/printTypeDebugInfo";
import { getDeclaration } from "../utils/symbolHelpers";
import { getMajorTypeFlag, isLiteral } from "../utils/typeHelpers";
import { getLiteralProperties } from "./get-literal-properties";
import { mapConditional } from "./mappers/map-conditional";
import { mapIndexedAccessType } from "./mappers/map-indexed-access-type";
import { mapStringMapping } from "./mappers/map-string-mapping";
import { mapTemplateLiteral } from "./mappers/map-template-literal";
import { mapTypeAlias } from "./mappers/map-type-alias";
import { mapTypeParameter } from "./mappers/map-type-parameter";
import { mapEnum } from "./mappers/mapEnum";
import { mapEnumLiteral } from "./mappers/mapEnumLiteral";
import { mapIndex } from "./mappers/map-index";
import { mapIntersection } from "./mappers/map-intersection";
import { mapObject } from "./mappers/map-object";
import { mapUnion } from "./mappers/map-union";
import { mapUniqueSymbol } from "./mappers/mapUniqueSymbol";
import { getTypeSourceLocationText } from "../tracers/getTypeSourceLocationText";

const TypeFlagsMappers: { [typeFlag: number]: TypeMapper } = {
	[ts.TypeFlags.Enum]: mapEnum as TypeMapper,
	[ts.TypeFlags.UniqueESSymbol]: mapUniqueSymbol as TypeMapper,
	[ts.TypeFlags.EnumLiteral]: mapEnumLiteral as TypeMapper,
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
 * @param symbol
 * @param context
 */
export function getTypeProperties(
	// typeReference: TransformerTypeReference,
	type: ts.Type,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeProperties {
	// 	log.trace(getTypeSourceLocationText(type, context));

	// It's gonna never be primitive type, cuz they are handled by getTypeRef()
	// const primitiveTypeProperties = getPrimitiveTypeProperties(type, context);
	//
	// 	if (primitiveTypeProperties !== undefined)
	// 	{
	// 		return primitiveTypeProperties;
	// 	}

	if (isLiteral(type)) {
		const literalDescriptionResult = getLiteralProperties(type, symbol, context);

		if (literalDescriptionResult !== undefined) {
			return literalDescriptionResult;
		}

		context.log.warn("Unhandled Literal type.\n\t" + printTypeDebugInfo(type, context.typeChecker));
		return { ...InvalidTypeProperties };
	}

	// It's a TypeAlias
	// if (hasReflectedTypeReference(symbol) && symbol.__ref.id != typeReference.id)
	if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.TypeAlias) !== 0) {
		return mapTypeAlias(type, symbol, context);
	}

	let mapper: TypeMapper;

	if ((type.flags & ts.TypeFlags.EnumLike) !== 0) {
		let enumSymbol = symbol ?? type.symbol;

		if ((enumSymbol.flags & ts.SymbolFlags.Enum) !== 0) {
			mapper = mapEnum as TypeMapper; // TODO: Review this; types does not match
		} else {
			context.log.warn(
				"No mapper found for an EnumLike type.\n\t" + printTypeDebugInfo(type, context.typeChecker)
			);
			return { ...InvalidTypeProperties };
		}
	} else {
		mapper = TypeFlagsMappers[getMajorTypeFlag(type)];
	}

	if (mapper === undefined) {
		context.log.warn(
			"No mapper found for the type.\n\t" +
				printTypeDebugInfo(type, context.typeChecker) +
				"\n\t" +
				getTypeSourceLocationText(type, context)
		);
		return { ...InvalidTypeProperties };
	}

	const mapperResult = mapper(type, symbol, context);

	if (mapperResult) {
		return mapperResult;
	}

	context.log.debug(
		`Mapper '${mapper.name}' returned invalid result.\n\t` + printTypeDebugInfo(type, context.typeChecker)
	);

	return { ...InvalidTypeProperties };
}
