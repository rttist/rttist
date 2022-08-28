import type {
	ConditionalTypeMetadata,
	TypeReference
}                   from "../declarations";
import { Metadata } from "../Metadata";
import { Type }     from "../Type";

export abstract class ConditionalType extends Type
{
	private readonly _extendsReference: TypeReference;
	private readonly _trueTypeReference: TypeReference;
	private readonly _falseTypeReference: TypeReference;

	private _extends?: Type;
	private _trueType?: Type;
	private _falseType?: Type;

	/**
	 * Extends type
	 */
	get extends(): Type
	{
		return this._extends ?? (this._extends = Metadata.resolveType(this._extendsReference));
	}

	/**
	 * True type
	 */
	get trueType(): Type
	{
		return this._trueType ?? (this._trueType = Metadata.resolveType(this._trueTypeReference));
	}

	/**
	 * False type
	 */
	get falseType(): Type
	{
		return this._falseType ?? (this._falseType = Metadata.resolveType(this._falseTypeReference));
	}

	protected constructor(initializer: ConditionalTypeMetadata)
	{
		super(initializer);

		this._extendsReference = initializer.extends;
		this._trueTypeReference = initializer.trueType;
		this._falseTypeReference = initializer.falseType;
	}
}