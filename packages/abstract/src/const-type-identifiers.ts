/**
 * @internal
 */
export const ModuleIds = {
	Native: "::native::",
	Dynamic: "::dynamic::",
	Unknown: "::unknown::",
};

/**
 * @internal
 */
export const NativeTypeIdPrefix = "native::";

/**
 * @internal
 */
export const TypeIds = {
	Any: NativeTypeIdPrefix + "any",
	Unknown: NativeTypeIdPrefix + "unknown",
	Void: NativeTypeIdPrefix + "void",
	Never: NativeTypeIdPrefix + "never",
	Null: NativeTypeIdPrefix + "null",
	Undefined: NativeTypeIdPrefix + "undefined",
};