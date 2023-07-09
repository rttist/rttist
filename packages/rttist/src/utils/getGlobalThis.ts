declare const global: typeof globalThis;

export function getGlobalThis(): any
{
	return typeof globalThis === "object"
		? globalThis
		: typeof window === "object"
			? window
			: global;
}