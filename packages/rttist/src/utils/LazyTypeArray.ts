import type { TypeReference } from "../declarations";
import type { MetadataLibrary } from "../MetadataLibrary";
import type { Type } from "../Type";
import { MetadataScope } from "../metadata-scope";

/**
 * @internal
 */
export class LazyTypeArray<TType = Type> {
	private readonly _references: ReadonlyArray<TypeReference>;
	private _types?: ReadonlyArray<TType>;
	private readonly metadataLibrary: MetadataLibrary = MetadataScope.current;

	public readonly length: number;

	get types(): ReadonlyArray<TType> {
		this._types ??= Object.freeze(this._references.map((type) => this.metadataLibrary.resolveType(type) as TType));
		return this._types;
	}

	constructor(typeRefs: ReadonlyArray<TypeReference>) {
		this._references = typeRefs;
		this.length = typeRefs.length;
	}
}
