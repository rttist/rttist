import type {
	TypeReference,
	UnionOrIntersectionTypeMetadata
}                   from "../declarations";
import { Metadata } from "../Metadata";
import { Type }     from "../Type";

export abstract class UnionOrIntersectionType extends Type
{
	protected abstract operatorSymbol: string;

	private readonly _typeReferences: TypeReference[];
	private _types?: Type[];

	/**
	 * Array of underlying types.
	 */
	get types(): ReadonlyArray<Type>
	{
		return (
			this._types ?? (this._types = this._typeReferences.map(type => Metadata.resolveType(type)))
		).slice();
	}

	protected constructor(initializer: UnionOrIntersectionTypeMetadata)
	{
		super(initializer);

		this._typeReferences = initializer.types || [];
	}

	/**
	 * Returns string representation of the type.
	 */
	toString(): string
	{
		return `{${this.types.map(t => t.toString()).join(this.operatorSymbol)}`;
	}
}