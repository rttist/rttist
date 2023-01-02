import type {
	AccessModifier,
	Accessor
} from "../enums";

export const AccessModifierFlagsOffset = 3;
export const AccessorFlagsOffset = 5;
export const AccessModifierFlagsMask = 0b11 << AccessModifierFlagsOffset;
export const AccessorFlagsMask = 0b11 << (AccessorFlagsOffset);

export function getAccessModifier(flags?: number): AccessModifier
{
	return ((flags || 0) & AccessModifierFlagsMask) >> (AccessModifierFlagsOffset);
}

export function getAccessor(flags?: number): Accessor
{
	return ((flags || 0) & AccessorFlagsMask) >> (AccessorFlagsOffset);
}