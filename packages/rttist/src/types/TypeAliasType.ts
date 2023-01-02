import type { TypeAliasTypeMetadata } from "../declarations";
import { Type }                       from "../Type";
import { LazyType }                   from "../utils/LazyType";

export class TypeAliasType extends Type
{
	/** @internal */
	private readonly _target: LazyType;

	get target(): Type
	{
		return this._target.type;
	}

	constructor(initializer: TypeAliasTypeMetadata)
	{
		super(initializer);
		this._target = new LazyType(initializer.target);
	}
}