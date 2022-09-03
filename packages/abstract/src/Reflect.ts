import { PROTOTYPE_TYPE_PROPERTY } from "@rtti/core";
import { GenericTypeRegister }     from "./GenericTypeRegister";
import {
	getGlobalThis,
	getTypeOfRuntimeValue
}                                  from "./helpers";
import { Type }                    from "./Type";

const ERROR_DISABLE_PROPERTY_NAME = "reflect-gettype-error-disable";

declare global
{
	namespace Reflect
	{
		/**
		 * The static Reflect.construct() method acts like the new operator, but as a function.
		 * It is equivalent to calling new target(...args). It gives also the added option to specify a different prototype.
		 * @param target The target function to call.
		 * @param argumentsList An array-like object specifying the arguments with which target should be called.
		 * @param newTarget The constructor whose prototype should be used. See also the new.target operator. If newTarget is not present, its value defaults to target.
		 * @returns A new instance of target (or newTarget, if present), initialized by target as a constructor with the given argumentsList.
		 */
		export function construct<TType>(target: { new(...args: any): TType } | Function, argumentsList: ArrayLike<any>, newTarget?: Function): TType;

		/**
		 * The static Reflect.construct() method acts like the new operator, but as a function.
		 * It is equivalent to calling new target(...args). It gives also the added option to specify a different prototype.
		 * @param target The target function to call.
		 * @param typeParameters An array specifying the type arguments.
		 * @param argumentsList An array-like object specifying the arguments with which target should be called.
		 * @param newTarget The constructor whose prototype should be used. See also the new.target operator. If newTarget is not present, its value defaults to target.
		 * @returns A new instance of target (or newTarget, if present), initialized by target as a constructor with the given argumentsList.
		 */
		export function constructGeneric<TType = any>(
			target: { new(...args: any): TType } | Function,
			typeParameters: Type[],
			argumentsList: ArrayLike<any>,
			newTarget?: Function
		): TType;

		/**
		 * Returns {@link Type} of runtime object.
		 * @param value
		 */
		export function getType(value: any): Type;

		/**
		 * Returns {@link Type} of type argument.
		 */
		export function getType<T = unknown>(): Type;

		/**
		 * Returns generic class from generic class definition.
		 * @param classCtor
		 * @param typeParameters
		 */
		export function getGenericClass<T extends { new(...args: any[]): any }>(classCtor: T, ...typeParameters: Type[]): T;

		/**
		 * @internal
		 * @param instance
		 * @param typeParameterIndex
		 */
		export function getClassTypeParam(instance: any, typeParameterIndex: number): Type;
	}
}

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