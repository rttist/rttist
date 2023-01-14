import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import { TypeReference }           from "../declarations";
import { Type }                    from "../Type";

export function constructGeneric<TType = any>(
	target: Function,
	typeParameters: Array<Type | TypeReference>,
	argumentsList: ArrayLike<any>,
	newTarget?: Function
): TType
{
	const Class = Rttist.getGenericClass(
		target,
		...typeParameters.map(tpReference => tpReference instanceof Type
			? tpReference
			: Rttist.resolveType(tpReference)
		)
	);

	if (newTarget !== undefined)
	{
		newTarget = inheritNewTarget(newTarget, Class);
	}

	return Reflect.construct(Class, argumentsList, newTarget ?? Class);
}

function inheritNewTarget(newTarget: Function, Class: Function)
{
	const name = newTarget.name !== undefined ? newTarget.name + "{}" : Class.name;
	const inheritedNewTarget = {
		[name]: class
		{
		}
	}[name];

	Object.setPrototypeOf(
		inheritedNewTarget.prototype,
		newTarget.prototype
	);

	(inheritedNewTarget.prototype as any)[PROTOTYPE_TYPE_PROPERTY] = Class.prototype[PROTOTYPE_TYPE_PROPERTY];

	return inheritedNewTarget;
}