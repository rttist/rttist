import type { TypeReference }          from "../declarations";
import { CALLSITE_TYPE_ARGS_PROPERTY } from "@rttist/core";
import { getGlobalThis }               from "../utils/getGlobalThis";
import {
	getTypeOfRuntimeValue
}                                      from "../helpers";
import { Type }                        from "../Type";

const ERROR_DISABLE_PROPERTY_NAME = "reflect-gettype-error-disable";

export function getType<T>(...args: any[]): Type
{
	if (args.length)
	{
		return getTypeOfRuntimeValue(args[0]);
	}

	const callSiteTypeArg = (getType as any)[CALLSITE_TYPE_ARGS_PROPERTY]?.[0] as TypeReference;
	(getType as any)[CALLSITE_TYPE_ARGS_PROPERTY] = undefined;

	if (callSiteTypeArg !== undefined)
	{
		return Reflect.resolveType(callSiteTypeArg);
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

	// In case of direct call, we'll return Unknown type.
	return Type.Unknown;
}