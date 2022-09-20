import { InterfaceTypeMetadata }        from "../declarations";
import { ExtendableObjectLikeTypeBase } from "./ExtendableObjectLikeTypeBase";

export class InterfaceType extends ExtendableObjectLikeTypeBase
{
	constructor(initializer: InterfaceTypeMetadata)
	{
		super(initializer);
	}
}