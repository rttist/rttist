import type {
	ModuleIdentifier,
	ModuleReference
} from "./declarations";
import type {
	AnyTypeMetadata
} from "./TypeMetadata";

export type ModuleMetadata = {
	id: ModuleIdentifier;
	name: string;
	path: string;
	children?: ModuleReference[];
	types?: AnyTypeMetadata[];
};