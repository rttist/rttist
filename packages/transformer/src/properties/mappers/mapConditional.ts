import * as ts                       from "typescript";
import { TypeKind }                  from "rttist";
import { Context }                   from "../../contexts/Context";
import { TypeMapperResult }          from "../../declarations/mappers";
import { ConditionalTypeProperties } from "../../declarations/TypeProperties";

export function mapConditional(type: ts.ConditionalType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	const ct = type.root.node;
	const extendsType = context.typeChecker.getTypeAtLocation(ct.extendsType);
	const trueType = context.typeChecker.getTypeAtLocation(ct.trueType);
	const falseType = context.typeChecker.getTypeAtLocation(ct.falseType);

	return {
		kind: TypeKind.ConditionalType,
		name: type.symbol.escapedName.toString(),
		extends: context.metadata.referenceType(extendsType, undefined, undefined, context),
		trueType: context.metadata.referenceType(trueType, undefined, undefined, context),
		falseType: context.metadata.referenceType(falseType, undefined, undefined, context)
	} as ConditionalTypeProperties;
}