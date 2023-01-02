import { TypeKind } from "./TypeKind";

export const LiteralTypeKinds = new Set([
	TypeKind.StringLiteral,
	TypeKind.NumberLiteral,
	TypeKind.True,
	TypeKind.False,
	TypeKind.BigIntLiteral,
	TypeKind.RegExpLiteral,
	TypeKind.TemplateLiteral,
	// TypeKind.EnumLiteral TODO: ?
]);

export const PrimitiveTypeKinds = new Set([
	TypeKind.String,
	TypeKind.Boolean,
	TypeKind.Number,
	TypeKind.BigInt,
	TypeKind.Symbol,
	TypeKind.UniqueSymbol,
	TypeKind.Null,
	TypeKind.Undefined
]);

export const NonPrimitiveKeywordTypeKinds = new Set([
	TypeKind.Void,
	TypeKind.Never,
	TypeKind.Unknown,
	TypeKind.Any,
	TypeKind.NonPrimitiveObject
]);

// export const ComparableByKind = new Set<TypeKind>([
// 	...PrimitiveTypeKinds, // TODO: UniqueSymbols are not comparable by kind
// 	TypeKind.Any,
// 	TypeKind.Unknown
// ]);