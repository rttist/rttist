import { ReflectFlags } from "../enums/ReflectFlags";

/**
 * Decorate a class and setup what you want to reflect or you can exclude whole class.
 * 
 * @param flags
 */
export function reflect(flags: ReflectFlags = ReflectFlags.TypeIdentifier)
{
	return function <T>(Constructor: { new(...args: any[]): T }) {
		return Constructor;
	};
}