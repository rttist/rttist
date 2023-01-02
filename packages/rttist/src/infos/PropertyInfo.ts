import type { PropertyInfoMetadata } from "../declarations";
import type { Type }                 from "../Type";
import {
	AccessModifier,
	Accessor,
	PropertyFlags
}                                    from "../enums";
import { MemberName }                from "../types";
import {
	getAccessModifier,
	getAccessor
}                                    from "../utils/flags";
import { LazyType }                  from "../utils/LazyType";
import { DecoratorInfo }             from "./DecoratorInfo";

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
	private readonly _type: LazyType;

	/**
	 * Property name
	 */
	readonly name: MemberName;

	/**
	 * @internal
	 */
	readonly metadata: PropertyInfoMetadata;

	/**
	 * Property type
	 */
	get type(): Type
	{
		return this._type.type;
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
	constructor(initializer: PropertyInfoMetadata)
	{
		this.name = new MemberName(initializer.name);
		this._type = new LazyType<Type>(initializer.type);
		this._decorators = Object.freeze((initializer.decorators || []).map(meta => new DecoratorInfo(meta)));
		this.metadata = initializer;
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

	toString(): string
	{
		return this.getDecorators().map(d => "@" + d.name).join(" ")
			+ (this.accessor ? Accessor[this.accessor] + " " : "")
			+ (this.accessModifier ? AccessModifier[this.accessModifier] + " " : "")
			+ (this.readonly ? "readonly " : "")
			+ `${this.name.toString()}${this.optional ? "?" : ""}: ${this.type.toString()}`;
	}
}