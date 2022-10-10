import type { SetTypeMetadata } from "../declarations";
import { TypeKind }             from "../enums";
import { Type }                 from "../Type";
import { GenericType }          from "./GenericType";

export class SetType extends Type implements GenericType<SetType>
{
	/**
	 * Definition of the generic type.
	 */
	get genericTypeDefinition(): GenericType<Type>
	{
		return this._definitionRef!.type;
	}

	constructor(initializer: SetTypeMetadata)
	{
		initializer.genericTypeDefinition = [TypeKind.SetDefinition];
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