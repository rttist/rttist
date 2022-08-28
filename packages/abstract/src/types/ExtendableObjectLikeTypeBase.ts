import type { TypeReference }                        from "../declarations";
import type { ExtendableObjectLikeBaseTypeMetadata } from "../declarations/TypeMetadata";
import { Metadata }                                  from "../Metadata";
import { Type }                                      from "../Type";
import { ObjectLikeTypeBase }                        from "./ObjectLikeTypeBase";

export class ExtendableObjectLikeTypeBase extends ObjectLikeTypeBase
{
	private readonly _baseTypeReference?: TypeReference;
	private _baseType?: ExtendableObjectLikeTypeBase;

	/**
	 * Base type
	 * @description Base type from which this type extends from or undefined if type is Object.
	 */
	get baseType(): ExtendableObjectLikeTypeBase | undefined
	{
		if (!this._baseTypeReference)
		{
			return undefined;
		}

		return this._baseType ?? (this._baseType = Metadata.resolveType(this._baseTypeReference) as ExtendableObjectLikeTypeBase);
	}

	constructor(initializer: ExtendableObjectLikeBaseTypeMetadata)
	{
		super(initializer);
		this._baseTypeReference = initializer.baseType;
	}

	/**
	 * Determines whether the current Type derives from the specified Type.
	 * @param {Type} targetType
	 */
	isDerivedFrom(targetType: Type): boolean
	{
		return this.is(targetType)
			|| this.baseType?.isAssignableTo(targetType)
			|| false;
	}
}