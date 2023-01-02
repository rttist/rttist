import { TypeKind }       from "rttist";
import { TypeProperties } from "./declarations/TypeProperties";

/**
 * The Unknown type properties.
 */
export const UnknownTypeProperties: TypeProperties = { kind: TypeKind.Unknown };

/**
 * Name of parameter for method/function declarations containing generic getType() calls
 */
export const TYPE_PARAMS_VAR_NAME = "__tp$";

/**
 * Package name/identifier
 */
export const PACKAGE_ID = "tst-reflect-transformer";

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