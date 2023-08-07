import type { ObjectTypeMetadata } from "../declarations";
import type { MetadataLibrary } from "../Metadata";
import { ObjectLikeTypeBase } from "./ObjectLikeTypeBase";

export class ObjectType extends ObjectLikeTypeBase {
	constructor(initializer: ObjectTypeMetadata, metadataLibrary: MetadataLibrary) {
		super(initializer, metadataLibrary);
	}
}
