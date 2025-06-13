import type { UnionOrIntersectionTypeMetadata } from "../declarations";
import { UnionOrIntersectionType } from "./UnionOrIntersectionType";

export class UnionType extends UnionOrIntersectionType {
	protected operatorSymbol = " | ";

	// biome-ignore lint/complexity/noUselessConstructor: This is bug! super constructor is private, we want to make it public.
	constructor(initializer: UnionOrIntersectionTypeMetadata) {
		super(initializer);
	}
}
