import { TypeKind } from "rttist";
import * as ts from "typescript";
import { InvalidTypeProperties } from "../consts";
import { Context } from "../contexts/Context";
import { TypeMapper } from "../declarations/mappers";
import {
	TypeAliasProperties,
	TypeProperties
} from "../declarations/TypeProperties";
import { printTypeDebugInfo } from "../tracers/printTypeDebugInfo";
import { getDeclaration } from "../utils/symbolHelpers";
import {
	getMajorTypeFlag,
	isLiteral
} from "../utils/typeHelpers";
import { getLiteralProperties } from "./getLiteralProperties";
import { mapConditional } from "./mappers/mapConditional";
import { mapEnum } from "./mappers/mapEnum";
import { mapEnumLiteral } from "./mappers/mapEnumLiteral";
import { mapIndex } from "./mappers/mapIndex";
import { mapIndexedAccessType } from "./mappers/mapIndexedAccessType";
import { mapIntersection } from "./mappers/mapIntersection";
import { mapObject } from "./mappers/mapObject";
import { mapStringMapping } from "./mappers/mapStringMapping";
import { mapTemplateLiteral } from "./mappers/mapTemplateLiteral";
import { mapTypeParameter } from "./mappers/mapTypeParameter";
import { mapUnion } from "./mappers/mapUnion";
import { mapUniqueSymbol } from "./mappers/mapUniqueSymbol";

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
 // * @param typeReference
 * @param type
 * @param symbol
 * @param context
 */
export function getTypeProperties(
	// typeReference: TransformerTypeReference,
	type: ts.Type,
	symbol: ts.Symbol | undefined,
	context: Context
): TypeProperties
{
	// 	log.trace(getTypeSourceLocationText(type, context));

	// It's gonna never be primitive type, cuz they are handled by getTypeRef()
	// const primitiveTypeProperties = getPrimitiveTypeProperties(type, context);
	//
	// 	if (primitiveTypeProperties !== undefined)
	// 	{
	// 		return primitiveTypeProperties;
	// 	}

	if (isLiteral(type))
	{
		const literalDescriptionResult = getLiteralProperties(type, symbol, context);

		if (literalDescriptionResult !== undefined)
		{
			return literalDescriptionResult;
		}

		context.log.warn("Unhandled Literal type.\n\t" + printTypeDebugInfo(type, context.typeChecker));
		return InvalidTypeProperties;
	}

	// TODO: Separate to mapTypeAlias file
	// TODO: Solve this. We don't want to generate properties for aliases
	// It's a TypeAlias
	// if (hasReflectedTypeReference(symbol) && symbol.__ref.id != typeReference.id)
	if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.TypeAlias) !== 0)
	{
		const declaration = getDeclaration<ts.TypeAliasDeclaration>(symbol);
		// const declaredSymbol = declaration && (
		// 	(declaration.type as any).symbol
		// 	|| context.typeChecker.getSymbolAtLocation(declaration.type)
		// );

		if (declaration)
		{
			if (declaration.type.kind === ts.SyntaxKind.TypeReference)
				// if (declaredSymbol && declaredSymbol != type.symbol)
			{
				return {
					name: symbol.escapedName.toString(),
					kind: TypeKind.Alias,
					target: context.metadata.referenceType(type, undefined, undefined, context)
				} as TypeAliasProperties;
			}

			if (declaration.type.kind === ts.SyntaxKind.UnionType)
			{
			}

			if (declaration.type.kind === ts.SyntaxKind.IntersectionType)
			{
			}

			if (declaration.type.kind === ts.SyntaxKind.LiteralType)
			{
			}
		}
	}

	let mapper: TypeMapper;

	if ((type.flags & ts.TypeFlags.EnumLike) !== 0)
	{
		let enumSymbol = symbol ?? type.symbol;

		if ((enumSymbol.flags & ts.SymbolFlags.Enum) !== 0)
		{
			mapper = mapEnum;
		}
		else
		{
			context.log.warn("No mapper found for an EnumLike type.\n\t" + printTypeDebugInfo(
				type,
				context.typeChecker
			));
			return InvalidTypeProperties;
		}
	}
	else
	{
		mapper = TypeFlagsMappers[getMajorTypeFlag(type)];
	}

	if (mapper === undefined)
	{
		context.log.warn("No mapper found for the type.\n\t" + printTypeDebugInfo(type, context.typeChecker));
		return InvalidTypeProperties;
	}

	const mapperResult = mapper(type, symbol, context);

	if (mapperResult)
	{
		return mapperResult;
	}

	context.log.debug(`Mapper '${mapper.name}' returned invalid result.\n\t` + printTypeDebugInfo(
		type,
		context.typeChecker
	));

	return InvalidTypeProperties;
}