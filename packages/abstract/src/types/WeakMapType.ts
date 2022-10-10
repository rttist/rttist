import type { WeakMapTypeMetadata } from "../declarations";
import { TypeKind }                 from "../enums";
import { Type }                     from "../Type";
import { GenericType }              from "./GenericType";

export class WeakMapType extends Type implements GenericType<WeakMapType>
{
	/**
	 * Definition of the generic type.
	 */
	get genericTypeDefinition(): GenericType<Type>
	{
		return this._definitionRef!.type;
	}

	constructor(initializer: WeakMapTypeMetadata)
	{
		initializer.genericTypeDefinition = [TypeKind.WeakMapDefinition];
		super(initializer);
	}

	/**
	 * Returns array of generic type arguments.
	 * @internal Exposed by {@link GenericType}.
	 */
	getTypeArguments(): readonly [Type, Type]
	{
		return this._typeArgumentsRef.types as unknown as [Type, Type];
	}
}