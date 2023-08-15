import { ModuleImporter, Type, MetadataLibrary } from "rttist";
// @ts-ignore
import { Metadata as InternalMetadataLibrary } from "./internal.typelib";

Type.configure({
	nullability: false,
});

ModuleImporter.registerImporters({
	// "@@this/controllers/HomeController": () => import("./controllers/HomeController"), // TODO: Add importers for all the reflected modules.
});

/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;