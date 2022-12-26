export function getGlobalThis(): any
{
	return typeof globalThis === "object"
		? globalThis
		: typeof window === "object"
			? window
			: global;
}