import type { Type }          from "../Type";
import type { TypeReference } from "./declarations";
import { Metadata }           from "../Metadata";

/**
 * Index description
 */
export class IndexInfo
{
	/**
	 * @internal
	 */
	private readonly _keyTypeReference: TypeReference;

	/**
	 * @internal
	 */
	private readonly _typeReference: TypeReference;

	/**
	 * @internal
	 */
	private _keyType?: Type;

	/**
	 * @internal
	 */
	private _type?: Type;

	/**
	 * Index key type.
	 */
	get keyType(): Type
	{
		return this._keyType ?? (this._keyType = Metadata.resolveType(this._keyTypeReference));
	}

	/**
	 * Index value type.
	 */
	get type(): Type
	{
		return this._type ?? (this._type = Metadata.resolveType(this._typeReference));
	}

	/**
	 * Readonly.
	 */
	readonly readonly: boolean;

	/**
	 * @param initializer
	 * @internal
	 */
	constructor(initializer: IndexInfoInitializer)
	{
		this._keyTypeReference = initializer.key;
		this._typeReference = initializer.type;
		this.readonly = initializer.readonly || false;
	}
}

export interface IndexInfoInitializer
{
	key: TypeReference;
	type: TypeReference;
	readonly?: boolean;
}