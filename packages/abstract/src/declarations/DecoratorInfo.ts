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
	readonly fullName?: string;

	/**
	 * @param initializer
	 */
	constructor(initializer: DecoratorInfoInitializer)
	{
		this.name = initializer.name;
		this.fullName = initializer.fullName;
		this._args = Object.freeze(initializer.args || []);
	}

	/**
	 * List of literal arguments
	 */
	getArguments(): ReadonlyArray<any>
	{
		return this._args;
	}
}

export interface DecoratorInfoInitializer
{
	name: string;
	fullName?: string;
	args?: Array<any>;
}