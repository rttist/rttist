import * as ts from "typescript";

export function printSymbolFlags(symbol: ts.Symbol): string
{
	const result = [];
	const flags = symbol.flags;

	if ((flags & 1) === 1) result.push("1 (FunctionScopedVariable)");
	if ((flags >> 1 & 1) === 1) result.push("2 (BlockScopedVariable)");
	if ((flags >> 2 & 1) === 1) result.push("4 (Property)");
	if ((flags >> 3 & 1) === 1) result.push("8 (EnumMember)");
	if ((flags >> 4 & 1) === 1) result.push("16 (Function)");
	if ((flags >> 5 & 1) === 1) result.push("32 (Class)");
	if ((flags >> 6 & 1) === 1) result.push("64 (Interface)");
	if ((flags >> 7 & 1) === 1) result.push("128 (ConstEnum)");
	if ((flags >> 8 & 1) === 1) result.push("256 (RegularEnum)");
	if ((flags >> 9 & 1) === 1) result.push("512 (ValueModule)");
	if ((flags >> 10 & 1) === 1) result.push("1024 (NamespaceModule)");
	if ((flags >> 11 & 1) === 1) result.push("2048 (TypeLiteral)");
	if ((flags >> 12 & 1) === 1) result.push("4096 (ObjectLiteral)");
	if ((flags >> 13 & 1) === 1) result.push("8192 (Method)");
	if ((flags >> 14 & 1) === 1) result.push("16384 (Constructor)");
	if ((flags >> 15 & 1) === 1) result.push("32768 (GetAccessor)");
	if ((flags >> 16 & 1) === 1) result.push("65536 (SetAccessor)");
	if ((flags >> 17 & 1) === 1) result.push("131072 (Signature)");
	if ((flags >> 18 & 1) === 1) result.push("262144 (TypeParameter)");
	if ((flags >> 19 & 1) === 1) result.push("524288 (TypeAlias)");
	if ((flags >> 20 & 1) === 1) result.push("1048576 (ExportValue)");
	if ((flags >> 21 & 1) === 1) result.push("2097152 (Alias)");
	if ((flags >> 22 & 1) === 1) result.push("4194304 (Prototype)");
	if ((flags >> 23 & 1) === 1) result.push("8388608 (ExportStar)");
	if ((flags >> 24 & 1) === 1) result.push("16777216 (Optional)");
	if ((flags >> 25 & 1) === 1) result.push("33554432 (Transient)");
	if ((flags >> 26 & 1) === 1) result.push("67108864 (Assignment)");
	if ((flags >> 27 & 1) === 1) result.push("134217728 (ModuleExports)");

	return "flags: " + flags + " = " + result.join(" | ");
}