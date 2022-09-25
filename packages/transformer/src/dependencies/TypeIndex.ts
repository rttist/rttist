import {
	ModuleIdentifier,
	TypeIdentifier
} from "@rttist/abstract";

/**
 * Format of the type Index.
 */
export type TypeIndex = Array<{
	module: ModuleIdentifier;
	types: Array<TypeIdentifier>;
}>;