import type {
	IndexInfoMetadata,
	MethodInfoMetadata,
	PropertyInfoMetadata,
	SignatureMetadataBase,
} from "../declarations";
import { IndexInfo, MethodInfo, PropertyInfo, SignatureInfo } from "../infos";

export function mapSignatures(metadata: { signatures?: readonly SignatureMetadataBase[] }) {
	return Object.freeze((metadata.signatures || []).map((m) => new SignatureInfo(m)));
}

export function mapProperties(metadata: { properties?: readonly PropertyInfoMetadata[] }) {
	return Object.freeze((metadata.properties || []).map((m) => new PropertyInfo(m)));
}

export function mapMethods(metadata: { methods?: readonly MethodInfoMetadata[] }) {
	return Object.freeze((metadata.methods || []).map((m) => new MethodInfo(m)));
}

export function mapIndexes(metadata: { indexes?: readonly IndexInfoMetadata[] }) {
	return Object.freeze((metadata.indexes || []).map((m) => new IndexInfo(m)));
}
