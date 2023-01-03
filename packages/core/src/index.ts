export const PROTOTYPE_TYPE_PROPERTY = "[[type]]";
export const CALLSITE_TYPE_ARGS_PROPERTY = "[[csTArgs]]";
export const RTTIST_NAMESPACE = "Rttist";

export const FncNames = {
	createCallsite: "cs$",
	getClassTypeParameter: "getTP$",
	invalidTypeGenerator: "utg$",
	resolveFunctionCallsite: "resFnCs$",
	resolveMethodCallsite: "resMCs$"
} as const;

export const ModuleIds = {
	Native: "::native",
	Dynamic: "::dynamic",
	Invalid: "::invalid",
	RttistType: "@rttist/dist/Type",
	RttistModule: "@rttist/dist/Module",
} as const;

export const TypeIds = {
	Invalid: ModuleIds.Invalid + "::Invalid",
	Any: ModuleIds.Native + "::Any",
	Unknown: ModuleIds.Native + "::Unknown",
	Void: ModuleIds.Native + "::Void",
	Never: ModuleIds.Native + "::Never",
	Null: ModuleIds.Native + "::Null",
	Undefined: ModuleIds.Native + "::Undefined",
} as const;