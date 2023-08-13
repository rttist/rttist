import { getGlobalThis } from "./utils/getGlobalThis";

export function resolveSingletonInstance<T>(key: string, factory: () => T): T {
	const go = getGlobalThis();
	const s = Symbol.for(key);
	return go[s] || (go[s] = factory());
}
