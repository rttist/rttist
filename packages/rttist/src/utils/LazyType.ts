import type { TypeReference } from "../declarations";
import type { MetadataLibrary } from "../MetadataLibrary";
import type { Type } from "../Type";
import { MetadataScope } from "../metadata-scope";

/**
 * @internal
 */
export type TypeResolver = (typeRef: TypeReference) => Type;

/**
 * @internal
 */
export class LazyType<TType extends Type = Type> {
	// public static resolver: TypeResolver = () => {
	// 	throw new Error("LazyType.resolver not set.");
	// };

	private readonly _reference: TypeReference;
	private _type?: TType;
	private readonly metadataLibrary: MetadataLibrary = MetadataScope.current;

	get type(): TType {
		this._type ??= this.metadataLibrary.resolveType(this._reference) as TType;
		return this._type;
	}

	constructor(typeReference: TypeReference) {
		if (!typeReference) {
			throw new Error("Invalid type reference.");
		}

		this._reference = typeReference;
	}
}
