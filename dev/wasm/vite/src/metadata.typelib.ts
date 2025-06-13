/*
* This file is generated automatically by the RTTIST TypeGen tool.
* Do not edit it manually.
*/
import { ModuleImporter, MetadataLibrary, createGetTypeFunction, createCallsite, resolveFromFunctionCallsite, resolveFromMethodCallsite, getClassTypeParameter, Type } from "rttist";
import "rttist/dist/public.typelib";

// @ts-ignore; !! CONFIGURE THIS AS AN EXTERNAL DEPENDENCY !!
import { Metadata as InternalMetadataLibrary } from "./internal.typelib";

ModuleImporter.registerImporters({
	"@dev-wasm-vite/App": () => import("./App.js"),
	"@dev-wasm-vite/index": () => import("./index.js"),
	"@dev-wasm-vite/types/Component": () => import("./types/Component.js"),
	"@dev-wasm-vite/types/Parameter": () => import("./types/Parameter.js"),
	"@dev-wasm-vite/types/Signature": () => import("./types/Signature.js"),
});

export const getType: <T>(...args: any[]) => Type = createGetTypeFunction(InternalMetadataLibrary);
export const resolveType = InternalMetadataLibrary.resolveType.bind(InternalMetadataLibrary);
export const _ = {
	cs$: createCallsite,
	resFnCs$: resolveFromFunctionCallsite,
	resMCs$: resolveFromMethodCallsite,
	getTP$: getClassTypeParameter,
};
/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;