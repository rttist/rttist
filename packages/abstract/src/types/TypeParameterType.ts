import type {
	TypeParameterTypeMetadata,
	TypeReference
}                   from "../declarations";
import { Metadata } from "../Metadata";
import { Type }     from "../Type";

export class TypeParameterType extends Type
{
	private readonly _definitionReference: TypeReference;
	private readonly _constraintReference?: TypeReference;
	private readonly _defaultReference?: TypeReference;

	private _definition?: Type;
	private _constraint?: Type;
	private _default?: Type;

	/**
	 * Definition of the generic type.
	 */
	get definition(): Type
	{
		return this._definition ?? (this._definition = Metadata.resolveType(this._definitionReference));
	}

	/**
	 * Defined type constraint.
	 */
	get constraint(): Type | undefined
	{
		if (!this._constraintReference)
		{
			return undefined;
		}

		return this._constraint ?? (this._constraint = Metadata.resolveType(this._constraintReference));
	}

	/**
	 * Default value of the generic type.
	 */
	get default(): Type | undefined
	{
		if (!this._defaultReference)
		{
			return undefined;
		}

		return this._default ?? (this._default = Metadata.resolveType(this._defaultReference));
	}

	constructor(initializer: TypeParameterTypeMetadata)
	{
		super(initializer);

		this._definitionReference = initializer.genericTypeDefinition;
		this._constraintReference = initializer.constraint;
		this._defaultReference = initializer.default;
	}

	/**
	 * Check whether the type is generic.
	 */
	isTypeParameter(): this is TypeParameterType
	{
		return true;
	}
}