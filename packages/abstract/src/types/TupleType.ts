import type { TupleTypeMetadata } from "../declarations";
import { TypeKind }               from "../enums";
import { Type }                   from "../Type";
import { GenericType }            from "./GenericType";

export class TupleType extends Type implements GenericType<TupleType>
{
	/**
	 * Definition of the generic type.
	 */
	get genericTypeDefinition(): GenericType<Type>
	{
		return this._definitionRef!.type;
	}

	constructor(initializer: TupleTypeMetadata)
	{
		initializer.genericTypeDefinition = [TypeKind.ArrayDefinition];
		super(initializer);
	}

	/**
	 * Returns array of generic type arguments.
	 * @internal Exposed by {@link GenericType}.
	 */
	getTypeArguments(): ReadonlyArray<Type>
	{
		return this._typeArgumentsRef.types;
	}
}