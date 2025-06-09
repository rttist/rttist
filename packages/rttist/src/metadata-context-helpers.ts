import type { TypeIdentifier, TypeReference } from "./declarations";
import type { MetadataLibrary } from "./MetadataLibrary";

export type MetadataContextHelpers = {
	cs$: (
		fn: Function,
		context: any,
		typeArgs: { [typeParameterIndex: number]: TypeReference },
		...args: any[]
	) => unknown;
	resFnCs$: (fn: Function) => Array<TypeReference> | Generator<TypeReference, void, unknown>;
	getTP$: (instance: any, typeParameterName: string) => TypeIdentifier;
	getGC$: MetadataLibrary["getGenericClass"];
	cg$: MetadataLibrary["constructGeneric"];
};
