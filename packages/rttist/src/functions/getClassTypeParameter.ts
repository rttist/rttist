import type { ClassType }          from "../types";
import { Type }                    from "../Type";
import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";

export function getClassTypeParameter(instance: any, typeParameterName: string): Type
{
	const type = (Object.getPrototypeOf(instance)[PROTOTYPE_TYPE_PROPERTY] as ClassType);
	return type.getTypeArguments().find(ta => ta.name === typeParameterName) ?? Type.Invalid;
}