import type { MethodInfoMetadata } from "../declarations";
import { DecoratorInfo }           from "./DecoratorInfo";
import {
	AccessModifier,
	PropertyFlags
}                                  from "../enums";
import { MemberName }              from "../types";
import {
	getAccessModifier
}                                  from "../utils/flags";
import { SignatureInfo }           from "./SignatureInfo";

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
	private readonly _signatures: ReadonlyArray<SignatureInfo>;

	/**
	 * @internal
	 */
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;

	/**
	 * @internal
	 */
	private readonly _accessModifier: AccessModifier;

	/**
	 * @internal
	 */
	readonly metadata: MethodInfoMetadata;

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
	constructor(initializer: MethodInfoMetadata)
	{
		this.metadata = initializer;
		this._name = new MemberName(initializer.name);
		this._signatures = Object.freeze((initializer.signatures || []).map(meta => new SignatureInfo(meta)));
		this._decorators = Object.freeze((initializer.decorators || []).map(meta => new DecoratorInfo(meta)));
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
	getSignatures(): ReadonlyArray<SignatureInfo>
	{
		return this._signatures;
	}
}