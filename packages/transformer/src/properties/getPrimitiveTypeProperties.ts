import { TypeKind }                 from "@rttist/abstract";
import * as ts                      from "typescript";
import { NativeBaseTypeProperties } from "../declarations/TypeProperties";
import { getMajorTypeFlag }         from "../utils/typeHelpers";

/**
 * Return TypeProperties whether the type is a primitive native type.
 * @param type
 */
export function getPrimitiveTypeProperties(type: ts.Type/*, context: Context*/): NativeBaseTypeProperties | undefined
{
	return PrimitiveTypesRefMap[getMajorTypeFlag(type)];
}

const PrimitiveTypesRefMap: { [flag: number]: NativeBaseTypeProperties } = {
	[ts.TypeFlags.String]: { kind: TypeKind.String },
	[ts.TypeFlags.Number]: { kind: TypeKind.Number },
	[ts.TypeFlags.Boolean]: { kind: TypeKind.Boolean },
	[ts.TypeFlags.BigInt]: { kind: TypeKind.BigInt },
	[ts.TypeFlags.ESSymbol]: { kind: TypeKind.Symbol },
	[ts.TypeFlags.Any]: { kind: TypeKind.Any },
	[ts.TypeFlags.Unknown]: { kind: TypeKind.Unknown },
	[ts.TypeFlags.Never]: { kind: TypeKind.Never },
	[ts.TypeFlags.Undefined]: { kind: TypeKind.Undefined },
	[ts.TypeFlags.Null]: { kind: TypeKind.Null },
	[ts.TypeFlags.Void]: { kind: TypeKind.Void },
};