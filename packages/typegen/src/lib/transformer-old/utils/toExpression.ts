import type { Config }              from "../config/Config";
import * as ts                      from "typescript";
import { TypeKind }                 from "rttist";
import { SyntaxKind }               from "typescript";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";

export function toExpression(value: any, config: Config): ts.Expression
{
	if (value != undefined)
	{
		switch (typeof value)
		{
			case "string":
				return ts.factory.createStringLiteral(value);
			case "number":
				return ts.factory.createNumericLiteral(value);
			case "boolean":
				return value
					? ts.factory.createTrue()
					: ts.factory.createFalse();
		}

		// noinspection SuspiciousTypeOfGuard
		if (value instanceof Array)
		{
			return ts.factory.createArrayLiteralExpression(value.map(val => toExpression(val, config)));
		}

		// noinspection SuspiciousTypeOfGuard
		if (value instanceof TransformerTypeReference)
		{
			if (value.isKindOnly())
			{
				const ref = [
					ts.factory.createNumericLiteral(value.nativeReference.kind)
				];

				if (config.devMode)
				{
					ts.addSyntheticTrailingComment(
						ref[0],
						SyntaxKind.MultiLineCommentTrivia,
						TypeKind[value.nativeReference.kind]
					);
				}

				return ts.factory.createArrayLiteralExpression(ref);
			}

			return ts.factory.createStringLiteral(value.id);
		}

		if (value.constructor === Object)
		{
			let propertyAssignments: Array<ts.PropertyAssignment> = [];

			for (let prop in value)
			{
				// Ignoring properties assigned to undefined
				if (value.hasOwnProperty(prop) && value[prop] !== undefined)
				{
					propertyAssignments.push(ts.factory.createPropertyAssignment(
						prop,
						toExpression(value[prop], config)
					));
				}
			}

			return ts.factory.createObjectLiteralExpression(propertyAssignments);
		}

		if (isExpression(value))
		{
			return value;
		}
	}

	return ts.factory.createNull();
}

function isExpression(value: any)
{
	return value.hasOwnProperty("kind") && (value.constructor.name === "NodeObject" || value.constructor.name === "IdentifierObject" || value.constructor.name === "TokenObject");
}