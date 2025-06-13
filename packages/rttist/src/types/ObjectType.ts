import type { ObjectTypeMetadata } from "../declarations";
import { ObjectLikeTypeBase } from "./ObjectLikeTypeBase";

export class ObjectType extends ObjectLikeTypeBase {
	// biome-ignore lint/complexity/noUselessConstructor: This is bug! super constructor is private, we want to make it public.
	constructor(initializer: ObjectTypeMetadata) {
		super(initializer);
	}
}
