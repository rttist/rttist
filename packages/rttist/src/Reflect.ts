import type { TypeReference } from "./declarations";
import { Symbols } from "./symbols";
import type { Type } from "./Type";
import { getFunctionCallsiteTypeArgumentsOrInvalid } from "./functions/getFunctionCallsiteTypeArgumentsOrInvalid";
import { resolveMethodCallsite } from "./functions/resolveMethodCallsite";
import { invalidTypeGenerator } from "./functions/invalidTypeGenerator";
import { FncNames, RTTIST_NAMESPACE } from "@rttist/core";
import { createCallsite } from "./functions/createCallsite";
import { constructGeneric } from "./functions/constructGeneric";
import { getClassTypeParameterReference } from "./functions/getClassTypeParameterReference";
import { getGenericClass } from "./functions/getGenericClass";
import { getType } from "./functions/getType";
import { Metadata } from "./Metadata";
import { getGlobalThis } from "./utils/getGlobalThis";

declare global {
	namespace Reflect {
		/**
		 * The static Reflect.construct() method acts like the new operator, but as a function.
		 * It is equivalent to calling new target(...args). It gives also the added option to specify a different prototype.
		 * @param target The target function to call.
		 * @param argumentsList An array-like object specifying the arguments with which target should be called.
		 * @param newTarget The constructor whose prototype should be used. See also the new.target operator. If newTarget is not present, its value defaults to target.
		 * @returns A new instance of target (or newTarget, if present), initialized by target as a constructor with the given argumentsList.
		 */
		export function construct<TType>(
			target: { new (...args: any): TType } | Function,
			argumentsList: ArrayLike<any>,
			newTarget?: Function
		): TType;

		/**
		 * The static Reflect.construct() method acts like the new operator, but as a function.
		 * It is equivalent to calling new target(...args).
		 * It gives also the added option to specify a different prototype.
		 * @param target The target function to call.
		 * @param typeParameters An array specifying the type arguments.
		 * @param argumentsList An array-like object specifying the arguments with which target should be called.
		 * @param newTarget The constructor whose prototype should be used.
		 * See also the new.target operator. If newTarget is not present, its value defaults to target.
		 * @returns A new instance of target (or newTarget, if present),
		 * initialized by target as a constructor with the given argumentsList.
		 */
		export function constructGeneric<TType = any>(
			target: { new (...args: any): TType } | Function,
			typeParameters: Array<Type | TypeReference>,
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
		 * Returns a Type instance identified by the reference. Returns Type.Unknown if no Type found.
		 * @param reference
		 */
		export function resolveType(reference: TypeReference): Type;

		/**
		 * Returns generic class from generic class definition.
		 * @param classCtor
		 * @param typeParameters
		 */
		export function getGenericClass<T>(classCtor: Function, ...typeParameters: Type[]): Function;

		// /**
		//  * @internal
		//  * @param instance
		//  * @param typeParameterIndex
		//  */
		// export function getClassTypeParameter(instance: any, typeParameterIndex: number): Type;
		//
		// /**
		//  * @internal
		//  * @param fn
		//  * @param context
		//  * @param typeArgs
		//  * @param args
		//  */
		// export function createCallsite(fn: Function, context: any, typeArgs: { [typeParameterIndex: number]: TypeReference }, ...args: any[]): any;
	}

	const Rttist: Pick<typeof Reflect, "constructGeneric" | "getType" | "resolveType" | "getGenericClass">;
}

let RttistObj;
getGlobalThis()[RTTIST_NAMESPACE] = RttistObj = {
	getType: getType,
	resolveType: Metadata.resolveType.bind(Metadata),
	symbols: Symbols.metadata,
	[FncNames.getGenericClass]: getGenericClass,
	[FncNames.constructGeneric]: constructGeneric,
	[FncNames.getClassTypeParameter]: getClassTypeParameterReference,
	[FncNames.createCallsite]: createCallsite,
	[FncNames.invalidTypeGenerator]: invalidTypeGenerator,
	[FncNames.resolveFunctionCallsite]: getFunctionCallsiteTypeArgumentsOrInvalid,
	[FncNames.resolveMethodCallsite]: resolveMethodCallsite,
};

for (let key of Object.keys(RttistObj)) {
	(Reflect as any)[key] = RttistObj[key];
}
