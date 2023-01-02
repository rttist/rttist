import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import { Type }                    from "../Type";

export function getClassTypeParameter(instance: any, typeParameterIndex: number): Type
{
	return (Object.getPrototypeOf(instance)[PROTOTYPE_TYPE_PROPERTY] as Type)
		.getTypeArguments()[typeParameterIndex] ?? Type.Unknown;
}