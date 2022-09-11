export const PROTOTYPE_TYPE_PROPERTY = "[[type]]";

export const ModuleIds = {
	Native: "::native::",
	Dynamic: "::dynamic::",
	Unknown: "::unknown::",
};

export const NativeTypeIdPrefix = "native::";

export const TypeIds = {
	Any: NativeTypeIdPrefix + "any",
	Unknown: NativeTypeIdPrefix + "unknown",
	Void: NativeTypeIdPrefix + "void",
	Never: NativeTypeIdPrefix + "never",
	Null: NativeTypeIdPrefix + "null",
	Undefined: NativeTypeIdPrefix + "undefined",
};