/*
* This file is generated automatically by the RTTIST TypeGen tool.
* Do not edit it manually.
*/
import { ModuleImporter, MetadataLibrary, createGetTypeFunction, createCallsite, resolveFromFunctionCallsite, resolveFromMethodCallsite, getClassTypeParameter, } from "rttist";

// @ts-ignore; configure this as an external dependency
import { Metadata as InternalMetadataLibrary } from "./internal.typelib";

ModuleImporter.registerImporters({
	"@rttist/Type": () => import("./Type.js"),
	"@rttist/Module": () => import("./Module.js"),
});

export const getType = createGetTypeFunction(InternalMetadataLibrary);
export const resolveType = InternalMetadataLibrary.resolveType.bind(InternalMetadataLibrary);
export const _ = {
	cs$: createCallsite,
	resFnCs$: resolveFromFunctionCallsite,
	resMCs$: resolveFromMethodCallsite,
	getTP$: getClassTypeParameter,
};
/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;