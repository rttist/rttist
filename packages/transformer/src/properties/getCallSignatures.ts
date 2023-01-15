import * as ts                              from "typescript";
import { Context }                          from "../contexts/Context";
import { SignatureProperties }              from "../declarations/TypeProperties";
import { getSignatureParametersProperties } from "./getSignatureParametersProperties";

export function getCallSignatures(type: ts.Type, context: Context): SignatureProperties[]
{
	return type.getCallSignatures()
		.map(signature => ({
			parameters: getSignatureParametersProperties(signature, context),
			returnType: context.metadata.referenceType
			(
				signature.getReturnType(),
				false,
				undefined, // TODO: This can be a problem and not just here. If we don't get symbol from declaration, the symbol from type will be received, which will be symbol of the simplified type. Image case: `type X = string; function x(): X {} getType<x>().returnType.is(getType<X>())` it will return false, because getType<X>() will return X and getType<x>().returnType return string. Maybe it's OK cuz getType<X>() should return TypeAliasType. So everybody should check if (type.isAlias()) type.target ==; And TypeAliasType.is can be overriden to do this.target.is(typeToCheck). 
				undefined,
				context
			),
			typeParameters: signature.typeParameters
				?.map(typeParameter => context.metadata.referenceType(
					typeParameter,
					false,
					undefined,
					undefined,
					context
				)),
		}));
}