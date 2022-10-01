import type { Type }           from "../Type";
import type { FunctionType }   from "../types";
import type { TypeIdentifier } from "./declarations";

export interface DecoratorInfoInitializer
{
	name: string;
	id: TypeIdentifier;
	args?: Array<any>;
}

/**
 * Represents a decorator of a class, method or parameter.
 */
export class DecoratorInfo
{
	/**
	 * @internal
	 */
	private readonly _args: ReadonlyArray<any>;

	/**
	 * Decorator name
	 */
	readonly name: string;

	/**
	 * Decorator full name
	 */
	readonly id: TypeIdentifier;

	/**
	 * @param initializer
	 */
	constructor(initializer: DecoratorInfoInitializer)
	{
		this.name = initializer.name;
		this.id = initializer.id;
		this._args = Object.freeze(initializer.args || []);
	}

	/**
	 * List of literal arguments
	 */
	getArguments(): ReadonlyArray<any>
	{
		return this._args;
	}

	/**
	 * Check if this decorator is given type.
	 * @param decoratorType
	 */
	is(decoratorType: Type): decoratorType is FunctionType
	{
		return decoratorType.id === this.id;
	}
}