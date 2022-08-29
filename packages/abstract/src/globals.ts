import type { Type } from "./Type";

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
		export function constructGeneric<TType = any>(target: { new(...args: any): TType } | Function, typeParameters: Type[], argumentsList: ArrayLike<any>, newTarget?: Function): TType;
		
		/**
		 * Returns {@link Type} of runtime object.
		 * @param value
		 */
		export function getType(value: any): Type;

		/**
		 * Returns {@link Type} of type argument.
		 */
		export function getType<T>(): Type;

		/**
		 * Returns generic class from generic class definition.
		 * @param classCtor
		 * @param typeParameters
		 */
		export function getGenericClass<T extends { new(...args: any[]): any }>(classCtor: T, ...typeParameters: Type[]): T;

		/**
		 * Returns Type of the type parameter at given index.
		 * @internal
		 * @param instance
		 * @param typeParameterIndex
		 */
		export function getClassTypeParam(instance: any, typeParameterIndex: number): Type;
	}
}