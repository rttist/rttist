import type { InterfaceTypeMetadata } from "../declarations";
import type { TypeAliasType }         from "./TypeAliasType";
import { Type }                       from "../Type";
import { LazyTypeArray }              from "../utils/LazyTypeArray";
import { ObjectLikeTypeBase }         from "./ObjectLikeTypeBase";

export class InterfaceType extends ObjectLikeTypeBase
{
	/** @internal */
	private readonly _extendsRef: LazyTypeArray<InterfaceType | TypeAliasType>;

	/**
	 * Interface which this type implements
	 */
	get extends(): ReadonlyArray<InterfaceType | TypeAliasType>
	{
		return this._extendsRef.types;
	}

	constructor(initializer: InterfaceTypeMetadata)
	{
		super(initializer);
		this._extendsRef = new LazyTypeArray<InterfaceType | TypeAliasType>(initializer.extends || []);
	}

	/**
	 * Determines whether the current Type is derived from the specified targetType.
	 * @param {Type} targetType
	 */
	isDerivedFrom(targetType: Type): boolean
	{
		return this.is(targetType)
			|| this.extends.some(
				t => t.isInterface() ? t.isDerivedFrom(targetType) : t.is(targetType)
			)
			|| false;
	}
}