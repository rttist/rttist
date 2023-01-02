export enum ReflectFlags
{
	Exclude = 0,
	TypeIdentifier = 1,
	Properties = 1 << 1,
	Indexes = 1 << 2,
	Constructors = 1 << 3,
	Methods = 1 << 4,
	Decorators = 1 << 5,
	
	All = (0xff << 24) | (0xff << 16) | (0xff << 8) | (0xff)
}