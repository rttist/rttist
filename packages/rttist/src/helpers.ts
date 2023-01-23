import {
	ModuleIds,
	PROTOTYPE_TYPE_PROPERTY,
	TypeIds
}                        from "@rttist/core";
import {
	ParameterFlags,
	TypeKind
}                        from "./enums";
import { Module }        from "./Module";
import { getGlobalThis } from "./utils/getGlobalThis";
import { Metadata }      from "./Metadata";
import { Type }          from "./Type";
import { FunctionType }  from "./types";

export function resolveSingletonInstance<T>(key: string, Class: { new(): T }): T
{
	const go = getGlobalThis();
	const s = Symbol.for(key);
	return go[s] || (go[s] = new Class());
}

/**
 * @internal
 */
export const AnyArray = new Type({
	kind: TypeKind.Interface,
	name: "Array",
	id: ModuleIds.Native + "::Array{" + TypeIds.Any + "}",
	module: ModuleIds.Native,
	genericTypeDefinition: [TypeKind.ArrayDefinition],
	typeArguments: [TypeIds.Any]
});

/**
 * @internal
 */
export const UnknownFunction = new FunctionType({
	kind: TypeKind.Function,
	name: "Function",
	id: ModuleIds.Native + "::Function",
	module: ModuleIds.Native,
	signatures: [{
		parameters: [{
			name: "x",
			flags: ParameterFlags.Rest,
			type: AnyArray.id
		}],
		returnType: TypeIds.Unknown
	}]
});

export function getTypeOfRuntimeValue(value: any): Type
{
	if (value === undefined) return Type.Undefined;
	if (value === null) return Type.Null;
	if (typeof value === "string") return Type.String;
	if (typeof value === "symbol") return Type.Symbol;
	if (typeof value === "number") return Type.Number;
	if (typeof value === "boolean") return Type.Boolean;
	if (typeof value === "bigint") return Type.BigInt;
	if (value instanceof Date) return Type.Date;
	if (value instanceof Error) return Type.Error;
	if (value instanceof RegExp) return Type.RegExp;
	if (value instanceof Int8Array) return Type.Int8Array;
	if (value instanceof Uint8Array) return Type.Uint8Array;
	if (value instanceof Uint8ClampedArray) return Type.Uint8ClampedArray;
	if (value instanceof Int16Array) return Type.Int16Array;
	if (value instanceof Uint16Array) return Type.Uint16Array;
	if (value instanceof Int32Array) return Type.Int32Array;
	if (value instanceof Uint32Array) return Type.Uint32Array;
	if (value instanceof Float32Array) return Type.Float32Array;
	if (value instanceof Float64Array) return Type.Float64Array;
	if (value instanceof BigInt64Array) return Type.BigInt64Array;
	if (value instanceof BigUint64Array) return Type.BigUint64Array;
	if (value instanceof Type) return Type.Type;
	if (value instanceof Module) return Type.Module;

	if (value.constructor === undefined)
	{
		return Type.Unknown;
	}

	if (value.constructor === Object) return Type.NonPrimitiveObject;
	if (value.constructor === Array) return AnyArray;

	const typeRef = value.prototype?.[PROTOTYPE_TYPE_PROPERTY]
		|| value.constructor.prototype[PROTOTYPE_TYPE_PROPERTY]
		|| value[PROTOTYPE_TYPE_PROPERTY]
		|| undefined;

	if (typeRef !== undefined)
	{
		return Metadata.resolveType(typeRef);
	}

	return typeof value === "function" ? UnknownFunction : Type.Unknown;
}