import type { DecoratorInfo } from "./DecoratorInfo";
import type { TypeReference } from "./declarations";
import type { Type }          from "../Type";
import {
	AccessModifier,
	Accessor
}                             from "../index";
import { Metadata }           from "../Metadata";
import {
	AccessModifierFlagsOffset,
	AccessorFlagsOffset,
	getAccessModifier,
	getAccessor
}                             from "../utils/flags";

export enum PropertyFlags
{
	None = 0,

	Optional = 1,
	Readonly = 1 << 1,

	Private = AccessModifier.Private << (AccessModifierFlagsOffset),
	Protected = AccessModifier.Protected << (AccessModifierFlagsOffset),

	Getter = Accessor.Getter << (AccessorFlagsOffset),
	Setter = Accessor.Setter << (AccessorFlagsOffset),
}

export interface PropertyInfoInitializer
{
	flags: PropertyFlags;
	name: string;
	type: TypeReference;
	decorators?: Array<DecoratorInfo>;
}

/**
 * Details about property of an object.
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
		this.accessModifier = getAccessModifier(initializer.flags);
		this.accessor = getAccessor(initializer.flags);
		this.optional = (initializer.flags & PropertyFlags.Optional) !== 0;
		this.readonly = (initializer.flags & PropertyFlags.Readonly) !== 0;
	}

	/**
	 * Returns array of decorators
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators;
	}
}