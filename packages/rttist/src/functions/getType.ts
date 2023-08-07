import { getCallsiteTypeArguments } from "@rttist/core";
import { getGlobalThis } from "../utils/getGlobalThis";
import { getTypeOfRuntimeValue } from "../helpers";
import { Type } from "../Type";
import { LazyType } from "../utils/LazyType";

const ERROR_DISABLE_PROPERTY_NAME = "reflect-gettype-error-disable";

/**
 * Returns Type object for passed generic type parameter or function parameter.
 * @param [args] Optional parameter for cases when you want to get Type object from runtime value.
 * Always use generic type parameter if you can statically access the type.
 * Use this runtime function argument only if you have no other option.
 * It is reliable only for classes, functions and primitives (such as undefined, true, false, numbers, strings).
 * @example
 * getType<MyInterface>() // returns Type object for `MyInterface` interface.
 * getType<MyClass>() // returns Type object for `MyClass` class.
 * getType(someClassCtor) // returns Type object corresponding to class stored in `someClassCtor` variable.
 */
export function getType<T>(...args: any[]): Type {
	if (args.length) {
		return getTypeOfRuntimeValue(args[0]);
	}

	const callsiteArgs = getCallsiteTypeArguments(getType);

	if (callsiteArgs !== undefined) {
		if (callsiteArgs.length === 0 || callsiteArgs[0] === undefined) {
			return Type.Invalid;
		}

		return LazyType.resolver(callsiteArgs[0]);
		// return Reflect.resolveType(callsiteArgs[0]);
	}

	const globalObject = getGlobalThis();

	if (!globalObject[ERROR_DISABLE_PROPERTY_NAME]) {
		console.debug(
			"[ERR] Reflect: You are calling `getType()` function directly. " +
				"You have probably wrong configuration, because some @rttist transformer " +
				"should replace this call by the Type instance.\n" +
				"If you have right configuration it may be BUG so try to create an issue.\n" +
				"If it is not an issue and you don't want to see this debug message, " +
				"create field '" +
				ERROR_DISABLE_PROPERTY_NAME +
				"' in global object (window | global | globalThis) " +
				"eg. `window['" +
				ERROR_DISABLE_PROPERTY_NAME +
				"'] = true;`"
		);
	}

	// In case of direct call without argument nor callsite, we'll return Invalid type.
	return Type.Invalid;
}
