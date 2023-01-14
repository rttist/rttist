import {
	CALLSITE_TYPE_ARGS_PROPERTY,
	FncNames
}                        from "@rttist/core";
import { TypeReference } from "../declarations";

/**
 * Resolves callsite of a function or it returns generator of Invalid type references. 
 * @param fn
 */
export function getFunctionCallsiteTypeArgumentsOrInvalid(fn: Function)
{
	const callsiteArgs: TypeReference[] | undefined = (fn as any)[CALLSITE_TYPE_ARGS_PROPERTY];
	(fn as any)[CALLSITE_TYPE_ARGS_PROPERTY] = undefined;
	return callsiteArgs || (Rttist as any)[FncNames.invalidTypeGenerator]();
}
