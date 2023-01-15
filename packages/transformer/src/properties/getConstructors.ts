import * as ts                              from "typescript";
import { Context }                          from "../contexts/Context";
import { TransformerTypeReference }         from "../declarations/TransformerTypeReference";
import { SignatureProperties }              from "../declarations/TypeProperties";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

export function getConstructors(type: ts.Type, context: Context): SignatureProperties[] | undefined
{
	const constructors: Array<SignatureProperties> = [];
	const ctors = type.getConstructSignatures();

	for (let ctorSignature of ctors)
	{
		constructors.push({
			returnType: TransformerTypeReference.Void,
			parameters: getSignatureParametersProperties(ctorSignature, context)
		});
	}

	return constructors.length === 0 ? undefined : constructors;
}
