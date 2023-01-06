import { TypeReference } from "../declarations";

export function constructGeneric<TType = any>(
	target: { new(...args: any): TType } | Function,
	typeParameters: TypeReference[],
	argumentsList: ArrayLike<any>,
	newTarget?: Function
): TType
{
	const Class = Rttist.getGenericClass(
		target as { new(...args: any): TType },
		...typeParameters.map(tpReference => Rttist.resolveType(tpReference))
	);
	return Reflect.construct(Class, argumentsList, newTarget ?? Class);
}