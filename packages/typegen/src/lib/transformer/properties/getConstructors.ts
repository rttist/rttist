import * as ts from "typescript";
import { SignatureProperties } from "../../../declarations/type-properties";
import { TransformerTypeReference } from "../../metadata/transformer-type-reference";
import { Context } from "../contexts/context";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

export function getConstructors(type: ts.Type, context: Context): SignatureProperties[] | undefined {
	const constructors: Array<SignatureProperties> = [];
	const ctors = type.getConstructSignatures();

	for (let ctorSignature of ctors) {
		constructors.push({
			returnType: TransformerTypeReference.Void,
			parameters: getSignatureParametersProperties(ctorSignature, context),
		});
	}

	return constructors.length === 0 ? undefined : constructors;
}
