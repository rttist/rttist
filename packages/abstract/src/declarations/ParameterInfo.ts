import type { Type }     from "../Type";
import { Metadata }      from "../Metadata";
import { TypeReference } from "./declarations";
import { PropertyFlags } from "./PropertyInfo";

export enum ParameterFlags
{
	None = 0,

	Optional = 1,
	Rest = 1 << 1
}

export interface ParameterInfoInitializer
{
	flags: ParameterFlags;
	name: string;
	type: TypeReference;
}

/**
 * Details about parameter of method, function or constructor.
 */
export class ParameterInfo
{
	/**
	 * @internal
	 */
	private readonly _typeReference: TypeReference;

	/**
	 * @internal
	 */
	private _type?: Type;

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
		return this._type ?? (this._type = Metadata.resolveType(this._typeReference));
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: ParameterInfoInitializer)
	{
		this.name = initializer.name;
		this._typeReference = initializer.type;
		this.optional = (initializer.flags & ParameterFlags.Optional) !== 0;
		this.rest = (initializer.flags & ParameterFlags.Rest) !== 0;
	}
}