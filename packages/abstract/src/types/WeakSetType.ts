import type { WeakSetTypeMetadata } from "../declarations";
import { TypeKind }                 from "../enums";
import { Type }                     from "../Type";
import { GenericType }              from "./GenericType";

export class WeakSetType extends Type implements GenericType<WeakSetType>
{
	/**
	 * Definition of the generic type.
	 */
	get genericTypeDefinition(): GenericType<Type>
	{
		return this._definitionRef!.type;
	}

	constructor(initializer: WeakSetTypeMetadata)
	{
		initializer.genericTypeDefinition = [TypeKind.WeakSetDefinition];
		super(initializer);
	}

	/**
	 * Returns array of generic type arguments.
	 * @internal Exposed by {@link GenericType}.
	 */
	getTypeArguments(): readonly [Type]
	{
		return this._typeArgumentsRef.types as unknown as [Type];
	}
}