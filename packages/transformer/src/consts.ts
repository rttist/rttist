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