import { resolveSingletonInstance } from "./resolveSingletonInstance";
import { GlobalMetadataLibrary } from "./Metadata";

export const GlobalMetadata = resolveSingletonInstance(
	"rttist/Metadata",
	() =>
		new GlobalMetadataLibrary({
			nullability: false,
		})
);
