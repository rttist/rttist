export const PROTOTYPE_TYPE_PROPERTY = "[[type]]";

export const ModuleIds = {
	Native: "::native::",
	Dynamic: "::dynamic::",
	Unknown: "::unknown::",
};

export const TypeIds = {
	Invalid: "::invalid::id",
	Any: ModuleIds.Native + "any",
	Unknown: ModuleIds.Native + "unknown",
	Void: ModuleIds.Native + "void",
	Never: ModuleIds.Native + "never",
	Null: ModuleIds.Native + "null",
	Undefined: ModuleIds.Native + "undefined",
};