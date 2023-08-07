import type { InterfaceTypeMetadata } from "../declarations";
import type { MetadataLibrary } from "../Metadata";
import type { TypeAliasType } from "./TypeAliasType";
import { Type } from "../Type";
import { LazyTypeArray } from "../utils/LazyTypeArray";
import { ObjectLikeTypeBase } from "./ObjectLikeTypeBase";

export class InterfaceType extends ObjectLikeTypeBase {
	/** @internal */
	private readonly _extendsRef: LazyTypeArray<InterfaceType | TypeAliasType>;

	/**
	 * Interface which this type implements
	 */
	get extends(): ReadonlyArray<InterfaceType | TypeAliasType> {
		return this._extendsRef.types;
	}

	constructor(initializer: InterfaceTypeMetadata, metadataLibrary: MetadataLibrary) {
		super(initializer, metadataLibrary);
		this._extendsRef = new LazyTypeArray<InterfaceType | TypeAliasType>(metadataLibrary, initializer.extends || []);
	}

	/**
	 * Determines whether the current Type is derived from the specified targetType.
	 * @param {Type} targetType
	 */
	isDerivedFrom(targetType: Type): boolean {
		return (
			this.is(targetType) ||
			this.extends.some((t) => (t.isInterface() ? t.isDerivedFrom(targetType) : t.is(targetType))) ||
			false
		);
	}
}
