import { ReflectFlags } from "../enums/ReflectFlags";

/**
 * Decorate a class and setup what you want to reflect, or you can exclude whole class.
 *
 * @param flags
 */
export function reflect(flags: ReflectFlags = ReflectFlags.TypeIdentifier) {
	return <T>(Constructor: { new (...args: any[]): T }) => Constructor;
}

export function foo<TType>(t: number): string;
export function foo<TType>(t: string): string;
export function foo<TType>(t: number | string): string {
	return "";
}
