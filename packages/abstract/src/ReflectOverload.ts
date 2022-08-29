import { PROTOTYPE_TYPE_PROPERTY } from "@rtti/core";
import { GenericTypeRegister }     from "./GenericTypeRegister";
import {
	getGlobalThis,
	getTypeOfRuntimeValue
}                                  from "./helpers";
import { Type }                    from "./Type";

const ERROR_DISABLE_PROPERTY_NAME = "reflect-gettype-error-disable";

Reflect.getType = function getType<T>(...args: any[]): Type {
	if (args.length)
	{
		return getTypeOfRuntimeValue(args[0]);
	}

	const globalObject = getGlobalThis();

	if (!globalObject[ERROR_DISABLE_PROPERTY_NAME])
	{
		console.debug("[ERR] Reflect: You call `Reflect.getType()` function directly. " +
			"You have probably wrong configuration, because some @rtti transformer should replace this call by the Type instance.\n" +
			"If you have right configuration it may be BUG so try to create an issue.\n" +
			"If it is not an issue and you don't want to see this debug message, " +
			"create field '" + ERROR_DISABLE_PROPERTY_NAME + "' in global object (window | global | globalThis) eg. `window['" + ERROR_DISABLE_PROPERTY_NAME + "'] = true;`");
	}

	// In case of direct call, we'll return Unknown type.
	return Type.Unknown;
};

Reflect.getGenericClass = function getGenericClass<T extends { new(...args: any[]): any }>(classCtor: T, ...typeParameters: Type[]): T
{
	return GenericTypeRegister.getGenericClass(classCtor, typeParameters);
};

Reflect.getClassTypeParam = function getClassTypeParam(instance: any, typeParameterIndex: number): Type {
	return (Object.getPrototypeOf(instance)[PROTOTYPE_TYPE_PROPERTY] as Type)
		.getTypeParameters()[typeParameterIndex] ?? Type.Unknown;
};

Reflect.constructGeneric = function constructGeneric<TType = any>(
	target: { new(...args: any): TType } | Function,
	typeParameters: Type[],
	argumentsList: ArrayLike<any>,
	newTarget?: Function
): TType {
	const Class = Reflect.getGenericClass(target as { new(...args: any): TType }, ...typeParameters);
	return Reflect.construct(Class, argumentsList, newTarget);
};