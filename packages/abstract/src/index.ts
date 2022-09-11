// keep order of imports & exports - there are circular dependencies
import { LazyType }   from "./LazyType";
import { LazyModule } from "./LazyModule";
import { Type }       from "./Type";
import { Module }     from "./Module";
import { Metadata }   from "./Metadata";
import "./Reflect";

export *            from "./enums";
export *            from "./declarations";
export {
	Module,
	ModuleMetadata
}                   from "./Module";
export {
	Type
}                   from "./Type";
export *            from "./types";
export { Metadata } from "./Metadata";
export *            from "./builders"; // TODO: Remove this from abstract; What to do with "getTypeOfRuntimeVariable"?

LazyType.resolver = Metadata.resolveType;
LazyModule.resolver = Metadata.resolveModule;

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