/*
* This file is generated automatically by the RTTIST TypeGen tool.
* Do not edit it manually.
*/
import { ModuleImporter, MetadataLibrary, createGetTypeFunction } from "rttist";

// @ts-ignore; configure this as an external dependency
import { Metadata as InternalMetadataLibrary } from "./internal.typelib";

ModuleImporter.registerImporters({
	"@rttist/Type": () => import("./Type.js"),
	"@rttist/Module": () => import("./Module.js"),
});

export const getType = createGetTypeFunction(InternalMetadataLibrary);

/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;