import type { DecoratorInfoMetadata } from "../declarations";
import type { Type }                  from "../Type";
import type { FunctionType }          from "../types";
import type { TypeIdentifier }        from "../declarations";

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
	 * @internal
	 */
	readonly metadata: DecoratorInfoMetadata;

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
	constructor(initializer: DecoratorInfoMetadata)
	{
		this.metadata = initializer;
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