import type { UnionOrIntersectionTypeMetadata } from "../declarations";
import { UnionOrIntersectionType }              from "./UnionOrIntersectionType";

export class UnionType extends UnionOrIntersectionType
{
	protected operatorSymbol: string = " | ";

	constructor(initializer: UnionOrIntersectionTypeMetadata)
	{
		super(initializer);
	}
}