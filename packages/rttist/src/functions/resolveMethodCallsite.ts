import {
	CALLSITE_TYPE_ARGS_PROPERTY,
	FncNames
}                        from "@rttist/core";
import { TypeReference } from "../declarations";

/**
 * Resolves callsite of a method.
 * @param context
 * @param methodName
 */
export function resolveMethodCallsite(context: any, methodName: string)
{
	const callsiteArgs: TypeReference[] | undefined = context[methodName][CALLSITE_TYPE_ARGS_PROPERTY];
	context[methodName][CALLSITE_TYPE_ARGS_PROPERTY] = undefined;
	return callsiteArgs || (Rttist as any)[FncNames.invalidTypeGenerator]();
}
