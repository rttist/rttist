import type { IndexedAccessTypeMetadata } from "../declarations";
import { Type }                           from "../Type";
import { LazyType }                       from "../utils/LazyType";

export class IndexedAccessType extends Type
{
	private readonly _objectTypeRef: LazyType;
	private readonly _indexTypeRef: LazyType;

	/**
	 * Type of the base object
	 */
	get objectType(): Type
	{
		return this._objectTypeRef.type;
	}

	/**
	 * Type of the index.
	 */
	get indexType(): Type
	{
		return this._indexTypeRef.type;
	}

	constructor(initializer: IndexedAccessTypeMetadata)
	{
		super(initializer);

		this._objectTypeRef = new LazyType(initializer.objectType);
		this._indexTypeRef = new LazyType(initializer.indexType);
	}
}