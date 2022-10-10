import type { ConditionalTypeMetadata } from "../declarations";
import { Type }                         from "../Type";
import { LazyType }                     from "../utils/LazyType";

export class ConditionalType extends Type
{
	private readonly _extendsRef: LazyType;
	private readonly _trueTypeRef: LazyType;
	private readonly _falseTypeRef: LazyType;

	/**
	 * Extends type
	 */
	get extends(): Type
	{
		return this._extendsRef.type;
	}

	/**
	 * True type
	 */
	get trueType(): Type
	{
		return this._trueTypeRef.type;
	}

	/**
	 * False type
	 */
	get falseType(): Type
	{
		return this._falseTypeRef.type;
	}

	constructor(initializer: ConditionalTypeMetadata)
	{
		super(initializer);

		this._extendsRef = new LazyType(initializer.extends);
		this._trueTypeRef = new LazyType(initializer.trueType);
		this._falseTypeRef = new LazyType(initializer.falseType);
	}
}