import type {
	DecoratorInfoMetadata,
	IndexInfoMetadata,
	MethodInfoMetadata,
	PropertyInfoMetadata,
	SignatureMetadataBase,
} from "../declarations";
import type { MetadataLibrary } from "../Metadata";
import { DecoratorInfo, IndexInfo, MethodInfo, PropertyInfo, SignatureInfo } from "../infos";

export function mapDecorators(metadata: { decorators?: readonly DecoratorInfoMetadata[] }) {
	return Object.freeze((metadata.decorators ?? []).map((meta) => new DecoratorInfo(meta)));
}

export function mapSignatures(
	metadata: { signatures?: readonly SignatureMetadataBase[] },
	metadataLibrary: MetadataLibrary
) {
	return Object.freeze((metadata.signatures || []).map((m) => new SignatureInfo(m, metadataLibrary)));
}

export function mapProperties(
	metadata: { properties?: readonly PropertyInfoMetadata[] },
	metadataLibrary: MetadataLibrary
) {
	return Object.freeze((metadata.properties || []).map((m) => new PropertyInfo(m, metadataLibrary)));
}

export function mapMethods(metadata: { methods?: readonly MethodInfoMetadata[] }, metadataLibrary: MetadataLibrary) {
	return Object.freeze((metadata.methods || []).map((m) => new MethodInfo(m, metadataLibrary)));
}

export function mapIndexes(metadata: { indexes?: readonly IndexInfoMetadata[] }, metadataLibrary: MetadataLibrary) {
	return Object.freeze((metadata.indexes || []).map((m) => new IndexInfo(m, metadataLibrary)));
}
