import { getGlobalThis }            from "../utils/getGlobalThis";
import {
	getTypeOfRuntimeValue
}                                   from "../helpers";
import { Type }                     from "../Type";
import { getCallsiteTypeArguments } from "./getCallsiteTypeArguments";

const ERROR_DISABLE_PROPERTY_NAME = "reflect-gettype-error-disable";

export function getType<T>(...args: any[]): Type
{
	if (args.length)
	{
		return getTypeOfRuntimeValue(args[0]);
	}

	const callsiteArgs = getCallsiteTypeArguments(getType);

	if (callsiteArgs !== undefined)
	{
		if (callsiteArgs.length === 0 || callsiteArgs[0] === undefined) {
			return Type.Invalid;
		}
		
		return Reflect.resolveType(callsiteArgs[0]);
	}

	const globalObject = getGlobalThis();

	if (!globalObject[ERROR_DISABLE_PROPERTY_NAME])
	{
		console.debug("[ERR] Reflect: You are calling `getType()` function directly. " +
			"You have probably wrong configuration, because some @rttist transformer " +
			"should replace this call by the Type instance.\n" +
			"If you have right configuration it may be BUG so try to create an issue.\n" +
			"If it is not an issue and you don't want to see this debug message, " +
			"create field '" + ERROR_DISABLE_PROPERTY_NAME + "' in global object (window | global | globalThis) " +
			"eg. `window['" + ERROR_DISABLE_PROPERTY_NAME + "'] = true;`");
	}

	// In case of direct call without argument nor callsite, we'll return Invalid type.
	return Type.Invalid;
}