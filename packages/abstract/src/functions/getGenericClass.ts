import { GenericTypeRegister } from "../GenericTypeRegister";
import { Type }                from "../Type";

export function getGenericClass<T extends { new(...args: any[]): any }>(
	classCtor: T,
	...typeParameters: Type[]
): T
{
	return GenericTypeRegister.getGenericClass(classCtor, typeParameters);
}