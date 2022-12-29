import { CALLSITE_TYPE_ARGS_PROPERTY } from "@rttist/core";
import { TypeReference }               from "../declarations";

export function createCallsite(fn: Function, context: any, typeArgs: { [typeParameterIndex: number]: TypeReference }, ...args: any[])
{
	(fn as any)[CALLSITE_TYPE_ARGS_PROPERTY] = typeArgs;
	return Reflect.apply(fn, context, [...args]);
}