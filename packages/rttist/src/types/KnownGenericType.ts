import type {
	TypeMetadata,
	TypeReference
}                           from "../declarations";
import type { GenericType } from "./GenericType";
import { Type }             from "../Type";

export class KnownGenericType<TParams extends ReadonlyArray<Type>> extends Type
{
	/**
	 * Definition of the generic type.
	 */
	get genericTypeDefinition(): GenericType<Type>
	{
		return this._definitionRef!.type;
	}

	constructor(definition: TypeReference, initializer: TypeMetadata)
	{
		initializer.genericTypeDefinition = definition;
		super(initializer);
	}

	/**
	 * Returns array of generic type arguments.
	 * @internal Exposed by {@link GenericType}.
	 */
	getTypeArguments(): TParams
	{
		return this._typeArgumentsRef.types as unknown as TParams;
	}
}