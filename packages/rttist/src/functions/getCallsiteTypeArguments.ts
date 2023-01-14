import { CALLSITE_TYPE_ARGS_PROPERTY } from "@rttist/core";
import { TypeReference }               from "../declarations";

export function getCallsiteTypeArguments(fn: Function): TypeReference[] | undefined
{
	const callsiteArgs: TypeReference[] | undefined = (fn as any)[CALLSITE_TYPE_ARGS_PROPERTY];
	(fn as any)[CALLSITE_TYPE_ARGS_PROPERTY] = undefined;
	return callsiteArgs;
}