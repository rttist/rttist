import { TypeIdentifier } from "rttist";
import * as ts from "typescript";
import { TransformerType } from "../lib/transformer/syntax-type-checker/transformer-type";
import { TypePropertiesWithId } from "./type-properties";

/**
 * Type information.
 * @internal
 */
export type TypeInfo = {
	// typeReference: TransformerTypeReference;
	transformerType: TransformerType;
	typeId: TypeIdentifier;
	// typeId: TypeIdentifier;
	type: ts.Type;
	properties?: TypePropertiesWithId;
	nullable: boolean;
};
