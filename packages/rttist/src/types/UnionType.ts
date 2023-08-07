import type { UnionOrIntersectionTypeMetadata } from "../declarations";
import type { MetadataLibrary } from "../Metadata";
import { UnionOrIntersectionType } from "./UnionOrIntersectionType";

export class UnionType extends UnionOrIntersectionType {
	protected operatorSymbol: string = " | ";

	constructor(initializer: UnionOrIntersectionTypeMetadata, metadataLibrary: MetadataLibrary) {
		super(initializer, metadataLibrary);
	}
}
