import type { TypeReference } from "./declarations";
import type { Type }          from "./Type";

/**
 * @internal
 */
export type TypeResolver = (typeRef: TypeReference) => Type;

/**
 * @internal
 */
export class LazyType
{
	public static resolver: TypeResolver = () => {
		throw new Error("LazyType.resolver not set.");
	};

	private readonly _reference: TypeReference;
	private _type?: Type;

	get type(): Type
	{
		return this._type ?? (this._type = LazyType.resolver(this._reference));
	}

	constructor(typeReference: TypeReference)
	{
		this._reference = typeReference;
	}
}