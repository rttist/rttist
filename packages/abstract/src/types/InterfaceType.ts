import { InterfaceTypeMetadata }        from "../declarations";
import { ExtendableObjectLikeTypeBase } from "./ExtendableObjectLikeTypeBase";
import { GenericType }                  from "./GenericType";

export class InterfaceType extends ExtendableObjectLikeTypeBase
{
	constructor(initializer: InterfaceTypeMetadata)
	{
		super(initializer);
	}

	/**
	 * @inheritDoc
	 */
	isGenericType(): this is GenericType<InterfaceType>
	{
		return super.isGenericType();
	}
}