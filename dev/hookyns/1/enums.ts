import "rttist";

enum MyEnum
{
	First,
	Second = 20,
	Third,
	Fourth = "4"
}

const enum ConstEnum
{
	O,
	A = 4,
	B = A * 2,
}

enum FileAccess
{
	// constant members
	None,
	Read = 1 << 1,
	Write = 1 << 2,
	ReadWrite = Read | Write,
	// computed member
	G = "123".length,
}

Reflect.getType<MyEnum>();
Reflect.getType<typeof MyEnum>();
Reflect.getType<MyEnum.First>();
Reflect.getType<typeof FileAccess.Write>();
Reflect.getType<FileAccess>();

function x(x: ConstEnum = ConstEnum.B, y: FileAccess = FileAccess.G)
{

}