import type { Type } from "../Type";

export type GenericType<T extends Type> = T & {
	/**
	 * Returns array of generic type arguments.
	 */
	getTypeArguments(): ReadonlyArray<Type>;

	/**
	 * Definition of the generic type.
	 */
	get genericTypeDefinition(): GenericType<Type>;
};