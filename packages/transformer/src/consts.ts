import { TypeKind }                 from "@rtti/abstract";
import { TransformerTypeReference } from "./declarations/general";
import { TypeProperties }           from "./declarations/TypeProperties";

/**
 * Reference to the Unknown type.
 */
export const UnknownTypeReference: TransformerTypeReference = { kind: TypeKind.Unknown };

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
export const GENERIC_PARAMS = "__genericParams__";

/**
 * Package name/identifier
 */
export const PACKAGE_ID = "tst-reflect-transformer";

// /**
//  * Name of decorator or JSDoc comment marking method for tracing
//  */
// export const TRACE_DECORATOR = "trace";

// TODO: Move this from here and from /abstract to core
export const NativeTypeIdPrefix = "native::";