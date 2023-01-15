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
	import?: () => Promise<object | undefined>;
	children?: ModuleReference[];
	types?: AnyTypeMetadata[];
};