import { TypeKind }                 from "rttist";
import * as ts                      from "typescript";
import { SyntaxKind }               from "typescript";
import { TransformerContext }       from "../contexts/TransformerContext";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";

let devMode: boolean | undefined;

export function toExpression(value: any): ts.Expression
{
	if (value != undefined)
	{
		if (typeof value === "string")
		{
			return ts.factory.createStringLiteral(value);
		}

		if (typeof value === "number")
		{
			return ts.factory.createNumericLiteral(value);
		}

		if (typeof value === "boolean")
		{
			return value
				? ts.factory.createTrue()
				: ts.factory.createFalse();
		}

		if (value instanceof Array)
		{
			return ts.factory.createArrayLiteralExpression(value.map(val => toExpression(val)));
		}

		if (value instanceof TransformerTypeReference)
		{
			if (value.isKindOnly())
			{
				const ref = [
					ts.factory.createNumericLiteral(value.nativeReference.kind)
				];

				if (devMode === undefined ? (devMode = TransformerContext.instance.config.devMode) : devMode)
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
						toExpression(value[prop])
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