export const PROTOTYPE_TYPE_PROPERTY = "[[type]]";
export const CALLSITE_TYPE_ARGS_PROPERTY = "[[csTArgs]]";
export const RTTIST_NAMESPACE = "Rttist";
export const FncNames = {
	createCallsite: "cs$",
	getClassTypeParameter: "getTP$"
}

export const ModuleIds = {
	Native: "::native",
	RttistType: "@rttist/dist/Type",
	RttistModule: "@rttist/dist/Module",
	Dynamic: "::dynamic",
	Invalid: "::invalid",
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