import type { Type }     from "../Type";
import { Metadata }      from "../Metadata";
import { TypeReference } from "./declarations";

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
		this.optional = !!initializer.optional;
		this.rest = !!initializer.rest;
	}
}

export interface ParameterInfoInitializer
{
	name: string;
	type: TypeReference;
	optional?: boolean;
	rest?: boolean;
}