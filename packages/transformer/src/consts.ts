import { TypeKind }                 from "@rttist/abstract";
import { TransformerTypeReference } from "./declarations/general";
import { TypeProperties }           from "./declarations/TypeProperties";

/**
 * Reference to the Unknown type.
 */
export const UnknownTypeReference: TransformerTypeReference = { kind: TypeKind.Unknown };

/**
 * Reference to the Void type.
 */
export const VoidTypeReference: TransformerTypeReference = { kind: TypeKind.Void };

/**
 * The Unknown type properties.
 */
export const UnknownTypeProperties: TypeProperties = { kind: TypeKind.Unknown };

/**
 * Reference to the Any type.
 */
export const AnyTypeReference: TransformerTypeReference = { kind: TypeKind.Any };


/**
 * Name of parameter for method/function declarations containing generic getType() calls
 */
export const TYPE_PARAMS_VAR_NAME = "__typeParams__";

/**
 * Package name/identifier
 */
export const PACKAGE_ID = "tst-reflect-transformer";

// /**
//  * Name of decorator or JSDoc comment marking method for tracing
//  */
// export const TRACE_DECORATOR = "trace";