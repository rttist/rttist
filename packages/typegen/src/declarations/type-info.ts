import { TypeIdentifier } from "rttist";
import * as ts from "typescript";
import { TypePropertiesWithId } from "./type-properties";

/**
 * Type information.
 * @internal
 */
export type TypeInfo = {
	// typeReference: TransformerTypeReference;
	typeId: TypeIdentifier;
	type: ts.Type;
	properties?: TypePropertiesWithId;
	nullable: boolean;
};
