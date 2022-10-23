import type { UnionOrIntersectionTypeMetadata } from "../declarations";
import { Type }                                 from "../Type";
import { LazyTypeArray }                        from "../utils/LazyTypeArray";

export abstract class UnionOrIntersectionType extends Type
{
	protected abstract operatorSymbol: string;

	/**
	 * @internal
	 */
	private _types: LazyTypeArray;

	/**
	 * Array of underlying types.
	 */
	get types(): ReadonlyArray<Type>
	{
		return this._types.types;
	}

	protected constructor(initializer: UnionOrIntersectionTypeMetadata)
	{
		super(initializer);

		this._types = new LazyTypeArray<Type>(initializer.types || []);
	}

	/**
	 * Returns string representation of the type.
	 */
	toString(): string
	{
		return `{${this.types.map(t => t.toString()).join(this.operatorSymbol)}`;
	}
}