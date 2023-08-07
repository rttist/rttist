import type { TypeAliasTypeMetadata } from "../declarations";
import type { MetadataLibrary } from "../Metadata";
import { Type } from "../Type";
import { LazyType } from "../utils/LazyType";

export class TypeAliasType extends Type {
	/** @internal */
	private readonly _target: LazyType;

	get target(): Type {
		return this._target.type;
	}

	constructor(initializer: TypeAliasTypeMetadata, metadataLibrary: MetadataLibrary) {
		super(initializer, metadataLibrary);
		this._target = new LazyType(metadataLibrary, initializer.target);
	}
}
