import { PROTOTYPE_TYPE_INSTANCE_PROPERTY, type TypeIdentifier } from "@rttist/core";
import { Type } from "../Type";
import type { ClassType } from "../types";

export function getClassTypeParameter(instance: any, typeParameterName: string): TypeIdentifier {
	const classType = Object.getPrototypeOf(instance)[PROTOTYPE_TYPE_INSTANCE_PROPERTY] as ClassType;

	if (classType === undefined) {
		return Type.Invalid.id;
	}

	const argumentIndex = classType.genericTypeDefinition
		?.getTypeArguments()
		.findIndex((ta) => ta.name === typeParameterName);

	if (argumentIndex !== undefined && argumentIndex !== -1) {
		const type = classType.getTypeArguments()[argumentIndex];

		if (type !== undefined) {
			return type.id;
		}
	}

	return Type.Invalid.id;
}
