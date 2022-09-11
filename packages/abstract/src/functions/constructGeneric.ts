import { Type } from "../Type";

export function constructGeneric<TType = any>(
	target: { new(...args: any): TType } | Function,
	typeParameters: Type[],
	argumentsList: ArrayLike<any>,
	newTarget?: Function
): TType
{
	const Class = Reflect.getGenericClass(target as { new(...args: any): TType }, ...typeParameters);
	return Reflect.construct(Class, argumentsList, newTarget);
}