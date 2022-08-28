import type { Type } from "./Type";

declare global
{
	namespace Reflect
	{
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
	}
}