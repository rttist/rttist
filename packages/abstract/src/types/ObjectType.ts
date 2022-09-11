import type { ObjectLikeBaseTypeMetadata } from "../declarations";
import { ObjectLikeTypeBase }              from "./ObjectLikeTypeBase";

export class ObjectType extends ObjectLikeTypeBase
{
	constructor(initializer: ObjectLikeBaseTypeMetadata)
	{
		super(initializer);
	}
}