// keep order of imports
import { Metadata } from "./Metadata";
import { Module }   from "./Module";
import { Type }     from "./Type";
import "./Reflect";

export {
	Type
}        from "./Type";
export {
	Module,
	ModuleMetadata
}        from "./Module";
export * from "./enums";
export * from "./declarations";
export * from "./types";
export * from "./builders"; // TODO: Remove this from abstract; What to do with "getTypeOfRuntimeVariable"?

Metadata.addType(
	Type.Any,
	Type.Unknown,
	Type.Void,
	Type.Never,
	Type.Null,
	Type.Undefined,
	Type.Object,
	Type.String,
	Type.Number,
	Type.BigInt,
	Type.Boolean,
	Type.Date,
	Type.Symbol,
);

Metadata.addModule(
	Module.Native,
	Module.Unknown,
	Module.Dynamic
);