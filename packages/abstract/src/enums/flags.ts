import {
	AccessModifierFlagsOffset,
	AccessorFlagsOffset
}                         from "../utils/flags";
import { AccessModifier } from "./AccessModifier";
import { Accessor }       from "./Accessor";

export enum ParameterFlags
{
	None = 0,

	Optional = 1,
	Rest = 1 << 1
}

export enum MethodFlags
{
	Optional = 1,
	Static = 1 << 1,

	Private = AccessModifier.Private << (AccessModifierFlagsOffset),
	Protected = AccessModifier.Protected << (AccessModifierFlagsOffset),
}

export enum IndexFlags
{
	None = 0,

	Readonly = 1,
}

export enum PropertyFlags
{
	None = 0,

	Optional = 1,
	Readonly = 1 << 1,
	Static = 1 << 2,

	Private = AccessModifier.Private << (AccessModifierFlagsOffset),
	Protected = AccessModifier.Protected << (AccessModifierFlagsOffset),

	Getter = Accessor.Getter << (AccessorFlagsOffset),
	Setter = Accessor.Setter << (AccessorFlagsOffset),
}