import type { DecoratorInfo } from "./DecoratorInfo";
import { AccessModifier }     from "../enums";
import { Signature }          from "./Signature";

export interface MethodInfoInitializer
{
	name: string;
	signatures: Signature[];
	optional?: boolean;
	accessModifier?: AccessModifier;
	decorators?: DecoratorInfo[];
}

/**
 * Represents a method of a type.
 */
export class MethodInfo
{
	private readonly _name: string;
	private readonly _optional: boolean;
	private readonly _signatures: ReadonlyArray<Signature>;
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;
	private readonly _accessModifier: AccessModifier;

	/**
	 * Name of the method.
	 */
	get name(): string
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
		this._optional = !!initializer.optional;
		this._accessModifier = initializer.accessModifier ?? AccessModifier.Public;
		this._signatures = Object.freeze(initializer.signatures || []);
		this._decorators = Object.freeze(initializer.decorators || []);
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