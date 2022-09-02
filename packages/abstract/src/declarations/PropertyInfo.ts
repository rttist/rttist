import type { DecoratorInfo } from "./DecoratorInfo";
import type { TypeReference } from "./declarations";
import type { Type }          from "../Type";
import {
	AccessModifier,
	Accessor
}                             from "../index";
import { Metadata }           from "../Metadata";


export interface PropertyInfoInitializer
{
	name: string;
	type: TypeReference;
	decorators?: Array<DecoratorInfo>;
	optional?: boolean;
	readonly?: boolean;
	accessModifier?: AccessModifier;
	accessor?: Accessor;
}

/**
 * Details about property of an objec.
 */
export class PropertyInfo
{
	/**
	 * Property decorators
	 * @internal
	 */
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;
	
	/**
	 * @internal
	 */
	private readonly _typeReference: TypeReference;

	/**
	 * @internal
	 */
	private _type?: Type;

	/**
	 * Property name
	 */
	readonly name: string;

	/**
	 * Property type
	 */
	get type(): Type
	{
		return this._type ?? (this._type = Metadata.resolveType(this._typeReference));
	}

	/**
	 * Optional property
	 */
	readonly optional: boolean;

	/**
	 * Access modifier
	 */
	readonly accessModifier: AccessModifier;

	/**
	 * Accessor
	 */
	readonly accessor: Accessor;

	/**
	 * Readonly
	 */
	readonly readonly: boolean;

	/**
	 * @param initializer
	 */
	constructor(initializer: PropertyInfoInitializer)
	{
		this.name = initializer.name;
		this._typeReference = initializer.type;
		this._decorators = Object.freeze(initializer.decorators || []);
		this.optional = !!initializer.optional;
		this.accessModifier = initializer.accessModifier ?? AccessModifier.Public;
		this.accessor = initializer.accessor ?? Accessor.None;
		this.readonly = !!initializer.readonly;
	}

	/**
	 * Returns array of decorators
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators;
	}
}