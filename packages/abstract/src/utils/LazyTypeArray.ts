import type { TypeReference } from "../declarations";
import type { Type }          from "../Type";
import { LazyType }           from "./LazyType";

/**
 * @internal
 */
export class LazyTypeArray<TType = Type>
{
	private readonly _references: ReadonlyArray<TypeReference>;
	private _types?: ReadonlyArray<TType>;

	public readonly length: number;

	get types(): ReadonlyArray<TType>
	{
		return this._types ?? (this._types = Object.freeze(
			this._references.map(type => LazyType.resolver(type) as TType)
		));
	}

	constructor(typeRefs: ReadonlyArray<TypeReference>)
	{
		this._references = typeRefs;
		this.length = typeRefs.length;
	}
}