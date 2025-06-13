// keep order of imports & exports - there are circular dependencies
import { Type } from "./Type";
import { Module } from "./Module";
import { setGenericTypeFactory, setTypeFactory } from "./factories/TypeFactoryProvider";
import { TypeFactory, GenericTypeFactory } from "./factories";

setTypeFactory(TypeFactory);
setGenericTypeFactory(GenericTypeFactory);

import { GlobalMetadata } from "./global-library";
import { MetadataScope } from "./metadata-scope";
MetadataScope.setScope(GlobalMetadata);

/** @internal */
import { getNativeTypes } from "./native-types";
const { nativeTypes, nativeGenericTypeDefinitions, AnyArray, UnknownFunction } = getNativeTypes();

for (const [prop, type] of Object.entries(nativeTypes).concat(Object.entries(nativeGenericTypeDefinitions))) {
	(Type as any)[prop] = type;
}

(Module.Invalid as any) = new Module({ id: ModuleIds.Invalid, name: "invalid", path: "" });
(Module.Dynamic as any) = new Module({ id: ModuleIds.Dynamic, name: "dynamic", path: "" });
(Module.Native as any) = new Module({ id: ModuleIds.Native, name: "native", path: "" });

import "./globals";
import { ModuleIds } from "@rttist/core";

GlobalMetadata.addType(...Object.values(nativeTypes));
GlobalMetadata.addType(AnyArray, UnknownFunction);
GlobalMetadata.addModule(Module.Native, Module.Invalid, Module.Dynamic);

export { Module, Type, GlobalMetadata };
export type { MetadataContextHelpers } from "./metadata-context-helpers";

export * from "./enums";
export * from "./declarations";
export * from "./infos";
export * from "./types";
export { type MetadataLibrary, type ExpandableMetadataLibrary, BaseMetadataLibrary } from "./MetadataLibrary";
export { getClassTypeParameter } from "./functions/getClassTypeParameter";
// export { resolveFromMethodCallsite } from "./functions/resolveFromMethodCallsite";
export { resolveFromFunctionCallsite } from "./functions/resolveFromFunctionCallsite";
// export { constructGeneric } from "./functions/constructGeneric";
// export { getGenericClass } from "./functions/getGenericClass";
export { createCallsite } from "./functions/createCallsite";
export * from "./factories";
export * from "./symbols";
export { ModuleImporter } from "./ModuleImporter";
