import type { TypeReference } from "../declarations";
import type { Type }          from "../Type";

/**
 * @internal
 */
export type TypeResolver = (typeRef: TypeReference) => Type;

/**
 * @internal
 */
export class LazyType<TType extends Type = Type>
{
	public static resolver: TypeResolver = () => {
		throw new Error("LazyType.resolver not set.");
	};

	private readonly _reference: TypeReference;
	private _type?: TType;

	get type(): TType
	{
		return this._type ?? (this._type = LazyType.resolver(this._reference) as TType);
	}

	constructor(typeReference: TypeReference)
	{
		if (!typeReference)
		{
			throw new Error("Invalid type reference.");
		}

		this._reference = typeReference;
	}
}