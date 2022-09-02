import { TypeKind } from "./TypeKind";

export const LiteralTypeKinds = [
	TypeKind.StringLiteral,
	TypeKind.NumberLiteral,
	TypeKind.BooleanLiteral,
	TypeKind.BigIntLiteral,
	TypeKind.RegExpLiteral
];

export const PrimitiveTypeKinds = [
	TypeKind.String,
	TypeKind.Number,
	TypeKind.BigInt,
	TypeKind.Boolean,
	TypeKind.Symbol,
	TypeKind.Null,
	TypeKind.Undefined,
	TypeKind.Void,
	TypeKind.Never,
];

export const ComparableByKind = new Set<TypeKind>([
	...PrimitiveTypeKinds, // TODO: Verify if having Symbol here is Okay. Is every symbol a symbol? 
	TypeKind.Any,
	TypeKind.Unknown
]);