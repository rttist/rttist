// keep order of imports & exports - there are circular dependencies
import { LazyType }   from "./utils/LazyType";
import { LazyModule } from "./utils/LazyModule";
import { Type }       from "./Type";
import { Module }     from "./Module";
import { Metadata }   from "./Metadata";
import "./Reflect";

/** @internal*/
import {
	AnyArray,
	UnknownFunction
}                     from "./helpers";

export *            from "./enums";
export *            from "./declarations";
export {
	Module,
	ModuleMetadata
}                   from "./Module";
export {
	Type,
	NativeTypes
}                   from "./Type";
export *            from "./types";
export { Metadata } from "./Metadata";
// export *            from "./builders"; // TODO: Remove this from abstract; What to do with "getTypeOfRuntimeVariable"?

export { getType }               from "./functions/getType";
export { getClassTypeParameter } from "./functions/getClassTypeParameter";
export { constructGeneric }      from "./functions/constructGeneric";
export { getGenericClass }       from "./functions/getGenericClass";

LazyType.resolver = Metadata.resolveType;
LazyModule.resolver = Metadata.resolveModule;

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
	AnyArray,
	UnknownFunction
);

Metadata.addModule(
	Module.Native,
	Module.Invalid,
	Module.Dynamic
);