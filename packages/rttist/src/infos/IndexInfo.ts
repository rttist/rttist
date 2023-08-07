import type { MetadataLibrary } from "../Metadata";
import type { Type } from "../Type";
import type { IndexInfoMetadata } from "../declarations";
import { IndexFlags } from "../enums";
import { LazyType } from "../utils/LazyType";

/**
 * Index description
 */
export class IndexInfo {
	/**
	 * @internal
	 */
	private readonly _keyTypeRef: LazyType;

	/**
	 * @internal
	 */
	private readonly _typeRef: LazyType;

	/**
	 * @internal
	 */
	readonly metadata: IndexInfoMetadata;

	/**
	 * Index key type.
	 */
	get keyType(): Type {
		return this._keyTypeRef.type;
	}

	/**
	 * Index value type.
	 */
	get type(): Type {
		return this._typeRef.type;
	}

	/**
	 * Readonly.
	 */
	readonly readonly: boolean;

	/**
	 * @param initializer
	 * @param metadataLibrary
	 * @internal
	 */
	constructor(initializer: IndexInfoMetadata, metadataLibrary: MetadataLibrary) {
		this.metadata = initializer;
		this._keyTypeRef = new LazyType<Type>(metadataLibrary, initializer.key);
		this._typeRef = new LazyType<Type>(metadataLibrary, initializer.type);
		this.readonly = (initializer.flags & IndexFlags.Readonly) !== 0;
	}
}
