import { TypeKind }              from "@rttist/abstract";
import * as ts                   from "typescript";
import { Context }               from "../contexts/Context";
import { LiteralTypeProperties } from "../declarations/TypeProperties";
import { getTypeRef }            from "../utils/typeHelpers";

export function getLiteralProperties(type: ts.LiteralType, context: Context): LiteralTypeProperties | undefined
{
	const props: LiteralTypeProperties = {
		id: getTypeRef(type, context.typeChecker),
		kind: TypeKind.Unknown,
		value: type.value
	};

	switch (type.flags)
	{
		case ts.TypeFlags.NumberLiteral:
			props.kind = TypeKind.NumberLiteral;
			return props;
		case ts.TypeFlags.StringLiteral:
			props.kind = TypeKind.StringLiteral;
			return props;
		case ts.TypeFlags.BooleanLiteral:
			props.kind = TypeKind.BooleanLiteral;
			return props;
		case ts.TypeFlags.BigIntLiteral:
			props.kind = TypeKind.BigIntLiteral;
			return props;
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