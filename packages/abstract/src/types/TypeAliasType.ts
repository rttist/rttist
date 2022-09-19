import { TypeAliasTypeMetadata } from "../declarations";
import { Type }                  from "../Type";
import { LazyType }              from "../utils/LazyType";
import { GenericType }           from "./GenericType";

export class TypeAliasType extends Type
{
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

	/**
	 * @inheritDoc
	 */
	isGenericType(): this is GenericType<TypeAliasType>
	{
		return super.isGenericType();
	}
}