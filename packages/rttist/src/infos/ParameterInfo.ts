import type { Type }                  from "../Type";
import type { ParameterInfoMetadata } from "../declarations";
import { ParameterFlags }             from "../enums";
import { LazyType }                   from "../utils/LazyType";
import { DecoratorInfo }              from "./DecoratorInfo";

/**
 * Details about parameter of method, function or constructor.
 */
export class ParameterInfo
{
	/**
	 * @internal
	 */
	private _type: LazyType;

	/**
	 * @internal
	 */
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;

	/**
	 * Name of the parameter.
	 */
	readonly name: string;

	/**
	 * Parameter is optional.
	 */
	readonly optional: boolean;

	/**
	 * Parameter is the rest rest parameter.
	 */
	readonly rest: boolean;

	/**
	 * Type of the parameter.
	 */
	get type(): Type
	{
		return this._type.type;
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: ParameterInfoMetadata)
	{
		this.name = initializer.name;
		this._type = new LazyType(initializer.type);
		this.optional = (initializer.flags & ParameterFlags.Optional) !== 0;
		this.rest = (initializer.flags & ParameterFlags.Rest) !== 0;
		this._decorators = Object.freeze((initializer.decorators || []).map(meta => new DecoratorInfo(meta)));
	}

	/**
	 * Returns array of decorators.
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators;
	}
}