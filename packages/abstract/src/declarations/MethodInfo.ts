import { AccessModifier }     from "../enums";
import { MemberName }         from "../types/MemberName";
import {
	AccessModifierFlagsOffset,
	getAccessModifier
}                             from "../utils/flags";
import type { DecoratorInfo } from "./DecoratorInfo";
import { PropertyFlags }      from "./PropertyInfo";
import { Signature }          from "./Signature";

export enum MethodFlags
{
	Optional = 1,
	Static = 1 << 1,

	Private = AccessModifier.Private << (AccessModifierFlagsOffset),
	Protected = AccessModifier.Protected << (AccessModifierFlagsOffset),
}

export interface MethodInfoInitializer
{
	flags: MethodFlags;
	name: MemberName;
	signatures: Signature[];
	decorators?: DecoratorInfo[];
}

/**
 * Represents a method of a type.
 */
export class MethodInfo
{
	/**
	 * @internal
	 */
	private readonly _name: MemberName;

	/**
	 * @internal
	 */
	private readonly _optional: boolean;

	/**
	 * @internal
	 */
	private readonly _signatures: ReadonlyArray<Signature>;

	/**
	 * @internal
	 */
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;

	/**
	 * @internal
	 */
	private readonly _accessModifier: AccessModifier;

	/**
	 * Name of the method.
	 */
	get name(): MemberName
	{
		return this._name;
	}

	/**
	 * Method is optional.
	 */
	get optional(): boolean
	{
		return this._optional;
	}

	/**
	 * Access modifier.
	 */
	get accessModifier(): AccessModifier
	{
		return this._accessModifier;
	}

	/**
	 * Internal method constructor.
	 * @internal
	 */
	constructor(initializer: MethodInfoInitializer)
	{
		this._name = initializer.name;
		this._signatures = Object.freeze(initializer.signatures || []);
		this._decorators = Object.freeze(initializer.decorators || []);
		this._accessModifier = getAccessModifier(initializer.flags);
		this._optional = (initializer.flags & PropertyFlags.Optional) !== 0;
	}

	/**
	 * Returns array of decorators.
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators;
	}

	/**
	 * Returns array of method signatures.
	 */
	getSignatures(): ReadonlyArray<Signature>
	{
		return this._signatures;
	}
}