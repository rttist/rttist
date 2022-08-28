import { Metadata } from "./Metadata";
import { Type }     from "./Type";
import { Module }   from "./Module";
import "./globals";
import "./ReflectOverload";

export {
	Type
}        from "./Type";
export {
	Module,
	ModuleMetadata
}        from "./Module";
export * from "./enums";
export * from "./declarations";
export * from "./builders";

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