import * as ts from "typescript";
import { SignatureProperties } from "../../../declarations/type-properties";
import { Context } from "../contexts/context";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

export function getCallSignatures(type: ts.Type, context: Context): SignatureProperties[] {
	return type.getCallSignatures().map((signature) => ({
		parameters: getSignatureParametersProperties(signature, context),
		returnType: context.transformerContext.tsTypeTypeChecker.getType(signature.getReturnType(), undefined, false),
		typeParameters: signature.typeParameters?.map((typeParameter) => {
			const typeReference = context.transformerContext.tsTypeTypeChecker.getType(typeParameter, undefined, false);
			context.metadata.generateMetadataForType(
				typeReference,
				typeParameter,
				false,
				undefined,
				undefined,
				context
			);
			return typeReference;
		}),
	}));
}
