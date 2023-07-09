import { ModuleIds }                from "@rttist/core";
import * as ts                      from "typescript";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import {
	isLiteral,
	toBigIntLiteral
} from "../utils/typeHelpers";

export function getLiteralTypeReference(type: ts.Type)
{
	if (isLiteral(type))
	{
		const val = typeof (type.value) === "object"
			? toBigIntLiteral(type.value as ts.PseudoBigInt)
			: typeof (type.value) === "string"
				? "'" + type.value + "'"
				: type.value;

		return new TransformerTypeReference(
			ModuleIds.Native,
			"Literal(" + val + ")"
		);
	}
}