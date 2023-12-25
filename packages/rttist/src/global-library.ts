import { resolveSingletonInstance } from "./resolveSingletonInstance";
import { GlobalMetadataLibrary } from "./MetadataLibrary";

export const GlobalMetadata = resolveSingletonInstance(
	"rttist/Metadata",
	() =>
		new GlobalMetadataLibrary({
			nullability: false,
		})
);
