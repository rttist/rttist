import type { ObjectTypeMetadata } from "../declarations";
import { ObjectLikeTypeBase }      from "./ObjectLikeTypeBase";

export class ObjectType extends ObjectLikeTypeBase
{
	constructor(initializer: ObjectTypeMetadata)
	{
		super(initializer);
	}
}