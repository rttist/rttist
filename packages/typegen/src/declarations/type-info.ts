import * as ts from "typescript";
import { TransformerTypeReference } from "../lib/metadata/transformer-type-reference";
import { TypePropertiesWithId } from "./type-properties";

/**
 * Type information.
 * @internal
 */
export type TypeInfo = {
	typeReference: TransformerTypeReference;
	// transformerType: TransformerType;
	// typeId: TypeIdentifier;
	// typeId: TypeIdentifier;
	type: ts.Type;
	properties: TypePropertiesWithId;
	nullable: boolean;
};
