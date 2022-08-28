import type { Type } from "../Type";

export type GenericType<T extends Type> = T &
	{
		/**
		 * Returns array of generic type parameters.
		 */
		getTypeParameters(): ReadonlyArray<Type>;
	};