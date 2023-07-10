import * as ts from "typescript";
import { TransformerTypeReference } from "../metadata/transformer-type-reference";
import { getMajorTypeFlag } from "../utils/typeHelpers";

/**
 * Return TypeProperties whether the type is a primitive native type.
 * @param type
 */
export function getPrimitiveTypeReference(type: ts.Type): TransformerTypeReference | undefined {
	if ((type.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
		return (type as any).intrinsicName === "true" ? TransformerTypeReference.True : TransformerTypeReference.False;
	}

	if ((type.flags & ts.TypeFlags.NonPrimitive) !== 0 && (type as any).intrinsicName === "object") {
		return TransformerTypeReference.NonPrimitiveObject;
	}

	return PrimitiveTypesRefMap[getMajorTypeFlag(type)];
}

const PrimitiveTypesRefMap: { [flag: number]: TransformerTypeReference } = {
	[ts.TypeFlags.String]: TransformerTypeReference.String,
	[ts.TypeFlags.Number]: TransformerTypeReference.Number,
	[ts.TypeFlags.Boolean]: TransformerTypeReference.Boolean,
	[ts.TypeFlags.BigInt]: TransformerTypeReference.BigInt,
	[ts.TypeFlags.ESSymbol]: TransformerTypeReference.Symbol,
	[ts.TypeFlags.Any]: TransformerTypeReference.Any,
	[ts.TypeFlags.Unknown]: TransformerTypeReference.Unknown,
	[ts.TypeFlags.Never]: TransformerTypeReference.Never,
	[ts.TypeFlags.Undefined]: TransformerTypeReference.Undefined,
	[ts.TypeFlags.Null]: TransformerTypeReference.Null,
	[ts.TypeFlags.Void]: TransformerTypeReference.Void,
};
