import type { UnionOrIntersectionTypeMetadata } from "../declarations";
import { UnionOrIntersectionType }              from "./UnionOrIntersectionType";

export class IntersectionType extends UnionOrIntersectionType
{
	protected operatorSymbol: string = " & ";

	constructor(initializer: UnionOrIntersectionTypeMetadata)
	{
		super(initializer);
	}
}