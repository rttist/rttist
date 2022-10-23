import type { UniqueSymbolTypeMetadata } from "../declarations";
import { Type }                          from "../Type";

export type KnownUniqueSymbolType = UniqueSymbolType & {
	/**
	 * Get the Symbol represented by this Type.
	 */
	get symbol(): Symbol;
}

/**
 * Type for user-defined unique symbol.
 */
export class UniqueSymbolType extends Type
{
	/** @internal */
	private readonly _key?: string;
	/** @internal */
	private readonly _symbol?: symbol;

	get key(): string | undefined
	{
		return this._key;
	}

	/**
	 * Get the Symbol represented by this Type if the key in known.
	 */
	get symbol(): symbol | undefined
	{
		return this._symbol;
	}

	constructor(initializer: UniqueSymbolTypeMetadata)
	{
		super(initializer);

		this._key = initializer.key;

		if (initializer.key !== undefined)
		{
			this._symbol = Symbol.for(initializer.key);
		}
	}

	hasKey(): this is KnownUniqueSymbolType
	{
		return this._key !== undefined;
	}
}