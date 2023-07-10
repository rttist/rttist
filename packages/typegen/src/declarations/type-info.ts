import * as ts from "typescript";
import { TransformerTypeReference } from "../transformer/metadata/transformer-type-reference";
import { TypePropertiesWithId } from "./type-properties";

/**
 * Type information.
 * @internal
 */
export type TypeInfo = {
	typeReference: TransformerTypeReference;
	type: ts.Type;
	properties?: TypePropertiesWithId;
	nullable: boolean;
};
