// keep order of imports & exports - there are circular dependencies
import { LazyType } from "./utils/LazyType";
import { LazyModule } from "./utils/LazyModule";
import { Type } from "./Type";
import { Module } from "./Module";
import { Metadata } from "./Metadata";
import "./Reflect";

/** @internal*/
import { AnyArray, UnknownFunction } from "./helpers";

export * from "./enums";
export * from "./declarations";
export { Module } from "./Module";
export { Type, NativeTypes } from "./Type";
export * from "./infos";
export * from "./types";
export { Metadata, MetadataLibrary } from "./Metadata";
export { getType } from "./functions/getType";
export { getClassTypeParameterReference } from "./functions/getClassTypeParameterReference";
export { constructGeneric } from "./functions/constructGeneric";
export { getGenericClass } from "./functions/getGenericClass";
export * from "./factories";
export * from "./symbols";
export { ModuleImporter } from "./ModuleImporter";

LazyType.resolver = Metadata.resolveType.bind(Metadata);
LazyModule.resolver = Metadata.resolveModule.bind(Metadata);

Metadata.addType(
	Type.Invalid,
	Type.Any,
	Type.Unknown,
	Type.Void,
	Type.Never,
	Type.Null,
	Type.Undefined,
	Type.NonPrimitiveObject,
	Type.String,
	Type.Number,
	Type.BigInt,
	Type.Boolean,
	Type.True,
	Type.False,
	Type.Date,
	Type.Error,
	Type.Symbol,
	Type.UniqueSymbol,
	Type.RegExp,
	Type.Int8Array,
	Type.Uint8Array,
	Type.Uint8ClampedArray,
	Type.Int16Array,
	Type.Uint16Array,
	Type.Int32Array,
	Type.Uint32Array,
	Type.Float32Array,
	Type.Float64Array,
	Type.BigInt64Array,
	Type.BigUint64Array,
	Type.ArrayBuffer,
	Type.SharedArrayBuffer,
	Type.Atomics,
	Type.DataView,
	AnyArray,
	UnknownFunction
);

Metadata.addModule(Module.Native, Module.Invalid, Module.Dynamic);
