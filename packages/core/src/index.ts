export const PROTOTYPE_TYPE_PROPERTY = "[[type]]";

export const ModuleIds = {
	Native: "::native",
	Dynamic: "::dynamic",
	Unknown: "::unknown",
};

export const TypeIds = {
	Invalid: "::invalid::id",
	Any: ModuleIds.Native + "::Any",
	Unknown: ModuleIds.Native + "::Unknown",
	Void: ModuleIds.Native + "::Void",
	Never: ModuleIds.Native + "::Never",
	Null: ModuleIds.Native + "::Null",
	Undefined: ModuleIds.Native + "::Undefined",
};