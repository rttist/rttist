export enum ReflectFlags
{
	OnlyIdentifier,
	Properties = 1,
	Indexes = 1 << 1,
	Constructors = 1 << 2,
	Methods = 1 << 3,
	Decorators = 1 << 4,
}