import type { ESSymbolTypeMetadata } from "../declarations";
import { Type }                      from "../Type";

/**
 * Type for unique global symbols defined by ECMAScript such as iterator and hasInstance.
 */
export class ESSymbolType extends Type
{
	/** @internal */
	private readonly _key: string;
	/** @internal */
	private readonly _symbol: symbol;

	get key(): string
	{
		return this._key;
	}

	get symbol(): symbol
	{
		return this._symbol;
	}

	constructor(initializer: ESSymbolTypeMetadata)
	{
		super(initializer);
		this._key = initializer.key;
		this._symbol = (Symbol as any)[initializer.key];
	}

	toString(): string
	{
		return "@@" + this._key;
	}
}