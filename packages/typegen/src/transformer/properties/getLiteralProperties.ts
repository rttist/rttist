import * as ts                   from "typescript";
import { TypeKind }              from "rttist";
import { Context }               from "../contexts/Context";
import { LiteralTypeProperties } from "../declarations/TypeProperties";
import { toBigIntLiteral }       from "../utils/typeHelpers";
import { mapEnumLiteral }        from "./mappers/mapEnumLiteral";

export function getLiteralProperties(
	type: ts.LiteralType,
	symbol: ts.Symbol | undefined,
	context: Context
): LiteralTypeProperties | undefined
{
	if ((type.flags & ts.TypeFlags.EnumLiteral) !== 0)
	{
		return mapEnumLiteral(type, symbol, context);
	}

	const props = {
		kind: TypeKind.Unknown,
		value: type.value
	};

	switch (type.flags)
	{
		case ts.TypeFlags.NumberLiteral:
			props.kind = TypeKind.NumberLiteral;
			return props as LiteralTypeProperties;
		case ts.TypeFlags.StringLiteral:
			props.kind = TypeKind.StringLiteral;
			return props as LiteralTypeProperties;
		case ts.TypeFlags.BigIntLiteral:
			props.kind = TypeKind.BigIntLiteral;
			props.value = toBigIntLiteral(type.value as ts.PseudoBigInt);
			return props as LiteralTypeProperties;
	}

	// if (typeNode) // TODO: Try to solve using type, not typeNode
	// {
	// 	if (ts.isNoSubstitutionTemplateLiteral(typeNode))
	// 	{
	// 		props.kind = TypeKind.TemplateLiteral;
	// 		props.value = typeNode.text;
	// 		return props;
	// 	}
	// 	else if (ts.isTemplateLiteral(typeNode))
	// 	{
	// 		props.kind = TypeKind.TemplateLiteral;
	// 		props.value = undefined;
	// 		props.template = {
	// 			head: (typeNode as ts.TemplateExpression).head.text,
	// 			templateSpans: (typeNode as ts.TemplateExpression).templateSpans.map(span => ({ expression: span.expression.getText(), literal: span.literal.text }))
	// 		};
	// 	}
	// }

	return undefined;
}