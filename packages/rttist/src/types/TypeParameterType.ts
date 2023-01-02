import type { TypeParameterTypeMetadata } from "../declarations";
import { Type }                           from "../Type";
import { LazyType }                       from "../utils/LazyType";

export class TypeParameterType extends Type
{
	private _constraint?: LazyType;
	private _default?: LazyType;

	/**
	 * Defined type constraint.
	 */
	get constraint(): Type | undefined
	{
		return this._constraint?.type;
	}

	/**
	 * Default value of the generic type.
	 */
	get default(): Type | undefined
	{
		return this._default?.type;
	}

	constructor(initializer: TypeParameterTypeMetadata)
	{
		super(initializer);

		this._constraint = initializer.constraint ? new LazyType<Type>(initializer.constraint) : undefined;
		this._default = initializer.default ? new LazyType<Type>(initializer.default) : undefined;
	}
}