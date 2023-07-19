import { TypeKind } from "rttist";
import { TypeProperties } from "../../declarations/type-properties";

/**
 * The Invalid type properties.
 */
export const InvalidTypeProperties: TypeProperties = { kind: TypeKind.Invalid };

/**
 * Name (prefix) of parameter for method/function declarations containing generic getType() calls
 */
export const TYPE_PARAMS_VAR_NAME = "__tp$";

/**
 * Name (prefix) of the variable holding reference to "this".
 * Used in nested classes.
 */
export const SELF_VAR_NAME = "_self$";

/**
 * Package name/identifier
 */
export const PACKAGE_ID = "tst-reflect-transformer";

export const ERROR_PLACEHOLDER_STRING = "#error-01";

export const ESSymbols = new Set([
	"iterator",
	"asyncIterator",
	"hasInstance",
	"isConcatSpreadable",
	"match",
	"replace",
	"search",
	"species",
	"split",
	"toPrimitive",
	"toStringTag",
	"unscopables",
	"matchAll",
]);
