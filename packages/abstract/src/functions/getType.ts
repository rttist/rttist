import {
	getGlobalThis,
	getTypeOfRuntimeValue
}                                  from "../helpers";
import { Type }                    from "../Type";

const ERROR_DISABLE_PROPERTY_NAME = "reflect-gettype-error-disable";

export function getType<T>(...args: any[]): Type
{
	if (args.length)
	{
		return getTypeOfRuntimeValue(args[0]);
	}

	const globalObject = getGlobalThis();

	if (!globalObject[ERROR_DISABLE_PROPERTY_NAME])
	{
		console.debug("[ERR] Reflect: You call `Reflect.getType()` function directly. " +
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