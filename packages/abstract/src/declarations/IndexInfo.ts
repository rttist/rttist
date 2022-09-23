import type { Type }          from "../Type";
import { LazyType }           from "../utils/LazyType";
import type { TypeReference } from "./declarations";

export enum IndexFlags
{
	None = 0,

	Readonly = 1,
}

export interface IndexInfoInitializer
{
	flags: IndexFlags;
	key: TypeReference;
	type: TypeReference;
}

/**
 * Index description
 */
export class IndexInfo
{
	/**
	 * @internal
	 */
	private readonly _keyTypeRef: LazyType;

	/**
	 * @internal
	 */
	private readonly _typeRef: LazyType;

	/**
	 * Index key type.
	 */
	get keyType(): Type
	{
		return this._keyTypeRef.type;
	}

	/**
	 * Index value type.
	 */
	get type(): Type
	{
		return this._typeRef.type;
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
		this._keyTypeRef = new LazyType<Type>(initializer.key);
		this._typeRef = new LazyType<Type>(initializer.type);
		this.readonly = (initializer.flags & IndexFlags.Readonly) !== 0;
	}
}