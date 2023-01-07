import type { ClassType }          from "../types";
import { Type }                    from "../Type";
import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";

export function getClassTypeParameterReference(instance: any, typeParameterName: string): string
{
	const classType = (Object.getPrototypeOf(instance)[PROTOTYPE_TYPE_PROPERTY] as ClassType);
	const argumentIndex = classType.genericTypeDefinition?.getTypeArguments()
		.findIndex(ta => ta.name === typeParameterName);

	if (argumentIndex !== undefined && argumentIndex !== -1)
	{
		const type = classType.getTypeArguments()[argumentIndex];

		if (type !== undefined)
		{
			return type.id;
		}
	}

	return Type.Invalid.id;
}