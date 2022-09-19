import { TypeKind }       from "@rttist/abstract";
import { TypeProperties } from "./declarations/TypeProperties";

/**
 * The Unknown type properties.
 */
export const UnknownTypeProperties: TypeProperties = { kind: TypeKind.Unknown };

/**
 * Name of parameter for method/function declarations containing generic getType() calls
 */
export const TYPE_PARAMS_VAR_NAME = "__typeParams__";

/**
 * Package name/identifier
 */
export const PACKAGE_ID = "tst-reflect-transformer";