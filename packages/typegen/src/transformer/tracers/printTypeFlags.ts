import * as ts from "typescript";

export function printTypeFlags(type: ts.Type): string
{
	const typeFlags = [];
	const flags = type.flags;

	if ((flags & 1) === 1) typeFlags.push("1 (Any)");
	if ((flags >> 1 & 1) === 1) typeFlags.push("2 (Unknown)");
	if ((flags >> 2 & 1) === 1) typeFlags.push("4 (String)");
	if ((flags >> 3 & 1) === 1) typeFlags.push("8 (Number)");
	if ((flags >> 4 & 1) === 1) typeFlags.push("16 (Boolean)");
	if ((flags >> 5 & 1) === 1) typeFlags.push("32 (Enum)");
	if ((flags >> 6 & 1) === 1) typeFlags.push("64 (BigInt)");
	if ((flags >> 7 & 1) === 1) typeFlags.push("128 (StringLiteral)");
	if ((flags >> 8 & 1) === 1) typeFlags.push("256 (NumberLiteral)");
	if ((flags >> 9 & 1) === 1) typeFlags.push("512 (BooleanLiteral)");
	if ((flags >> 10 & 1) === 1) typeFlags.push("1024 (EnumLiteral)");
	if ((flags >> 11 & 1) === 1) typeFlags.push("2048 (BigIntLiteral)");
	if ((flags >> 12 & 1) === 1) typeFlags.push("4096 (ESSymbol)");
	if ((flags >> 13 & 1) === 1) typeFlags.push("8192 (UniqueESSymbol)");
	if ((flags >> 14 & 1) === 1) typeFlags.push("16384 (Void)");
	if ((flags >> 15 & 1) === 1) typeFlags.push("32768 (Undefined)");
	if ((flags >> 16 & 1) === 1) typeFlags.push("65536 (Null)");
	if ((flags >> 17 & 1) === 1) typeFlags.push("131072 (Never)");
	if ((flags >> 18 & 1) === 1) typeFlags.push("262144 (TypeParameter)");
	if ((flags >> 19 & 1) === 1) typeFlags.push("524288 (Object)");
	if ((flags >> 20 & 1) === 1) typeFlags.push("1048576 (Union)");
	if ((flags >> 21 & 1) === 1) typeFlags.push("2097152 (Intersection)");
	if ((flags >> 22 & 1) === 1) typeFlags.push("4194304 (Index)");
	if ((flags >> 23 & 1) === 1) typeFlags.push("8388608 (IndexedAccess)");
	if ((flags >> 24 & 1) === 1) typeFlags.push("16777216 (Conditional)");
	if ((flags >> 25 & 1) === 1) typeFlags.push("33554432 (Substitution)");
	if ((flags >> 26 & 1) === 1) typeFlags.push("67108864 (NonPrimitive)");
	if ((flags >> 27 & 1) === 1) typeFlags.push("134217728 (TemplateLiteral)");
	if ((flags >> 28 & 1) === 1) typeFlags.push("268435456 (StringMapping)");
	
	let text = "flags: " + flags + " = " + typeFlags.join(" | ");
	
	if ((type.flags & ts.TypeFlags.Object) !== 0) {
		const objectFlags = [];
		const flags = (type as ts.ObjectType).objectFlags;

		if ((flags & 1) === 1) objectFlags.push("1 (Class)");
		if ((flags >> 1 & 1) === 1) objectFlags.push("2 (Interface)");
		if ((flags >> 2 & 1) === 1) objectFlags.push("4 (Reference)");
		if ((flags >> 3 & 1) === 1) objectFlags.push("8 (Tuple)");
		if ((flags >> 4 & 1) === 1) objectFlags.push("16 (Anonymous)");
		if ((flags >> 5 & 1) === 1) objectFlags.push("32 (Mapped)");
		if ((flags >> 6 & 1) === 1) objectFlags.push("64 (Instantiated)");
		if ((flags >> 7 & 1) === 1) objectFlags.push("128 (ObjectLiteral)");
		if ((flags >> 8 & 1) === 1) objectFlags.push("256 (EvolvingArray)");
		if ((flags >> 9 & 1) === 1) objectFlags.push("512 (ObjectLiteralPatternWithComputedProperties)");
		if ((flags >> 10 & 1) === 1) objectFlags.push("1024 (ReverseMapped)");
		if ((flags >> 11 & 1) === 1) objectFlags.push("2048 (JsxAttributes)");
		if ((flags >> 12 & 1) === 1) objectFlags.push("4096 (MarkerType)");
		if ((flags >> 13 & 1) === 1) objectFlags.push("8192 (JSLiteral)");
		if ((flags >> 14 & 1) === 1) objectFlags.push("16384 (FreshLiteral)");
		if ((flags >> 15 & 1) === 1) objectFlags.push("32768 (ArrayLiteral)");
		if ((flags >> 16 & 1) === 1) objectFlags.push("65536 (PrimitiveUnion)");
		if ((flags >> 17 & 1) === 1) objectFlags.push("131072 (ContainsWideningType)");
		if ((flags >> 18 & 1) === 1) objectFlags.push("262144 (ContainsObjectOrArrayLiteral)");
		if ((flags >> 19 & 1) === 1) objectFlags.push("524288 (NonInferrableType)");
		if ((flags >> 20 & 1) === 1) objectFlags.push("1048576 (CouldContainTypeVariablesComputed)");
		if ((flags >> 21 & 1) === 1) objectFlags.push("2097152 (CouldContainTypeVariables)");
		if ((flags >> 22 & 1) === 1) objectFlags.push("4194304 (ContainsSpread)");
		if ((flags >> 23 & 1) === 1) objectFlags.push("8388608 (ObjectRestType)");
		
		text += "; object flags: " + flags + " = " + objectFlags.join(" | ");
	}

	return text;
}