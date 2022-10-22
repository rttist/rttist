// import type { ArrayTypeMetadata } from "../declarations";
// import { TypeKind }               from "../enums";
// import { Type }                   from "../Type";
// import { GenericType }            from "./GenericType";
//
// export class ArrayType extends Type implements GenericType<ArrayType>
// {
// 	/**
// 	 * Definition of the generic type.
// 	 */
// 	get genericTypeDefinition(): GenericType<Type>
// 	{
// 		return this._definitionRef!.type;
// 	}
//
// 	constructor(initializer: ArrayTypeMetadata)
// 	{
// 		initializer.genericTypeDefinition = [TypeKind.ArrayDefinition];
// 		super(initializer);
// 	}
//
// 	/**
// 	 * Returns array of generic type arguments.
// 	 * @internal Exposed by {@link GenericType}.
// 	 */
// 	getTypeArguments(): readonly [Type]
// 	{
// 		return this._typeArgumentsRef.types as unknown as [Type];
// 	}
// }