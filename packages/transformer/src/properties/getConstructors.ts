import * as ts                              from "typescript";
import { Context }                          from "../contexts/Context";
import { TransformerTypeReference }         from "../declarations/general";
import { SignatureProperties }              from "../declarations/TypeProperties";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

export function getConstructors(type: ts.Type, context: Context): SignatureProperties[]// | undefined // TODO: Optimize by returning undefined when no ctors exists?
{
	const constructors: Array<SignatureProperties> = [];
	const ctors = type.getConstructSignatures();

	for (let ctorSignature of ctors)
	{
		constructors.push({
			returnType: TransformerTypeReference.Void,
			parameters: getSignatureParametersProperties(ctorSignature, context),
			//typeParameters: [] // TODO: Remove. Constructors have no type parameters ctorSignature.typeParameters?.map(typeParameter => getTypeParameterProperties(typeParameter, context))
		});
	}

	return constructors;//.length ? constructors : undefined;
}
