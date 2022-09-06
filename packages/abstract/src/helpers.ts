import { PROTOTYPE_TYPE_PROPERTY } from "@rtti/core";
import {
	FunctionBuilder,
	ObjectLiteralTypeBuilder,
	TypeBuilder
}                                  from "./builders";
import { Metadata }                from "./Metadata";
import { Type }                    from "./Type";

const ArrayItemsCountToCheckItsType = 10;

export function getGlobalThis(): any
{
	return typeof globalThis === "object"
		? globalThis
		: typeof window === "object"
			? window
			: global;
}

export function resolveSingletonInstance<T>(key: string, Class: { new(): T }): T
{
	const go = getGlobalThis();
	const s = Symbol.for(key);
	return go[s] || (go[s] = new Class());
}

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
	if (value.constructor === Object) return ObjectLiteralTypeBuilder.fromObject(value);

	if (!value.constructor)
	{
		return Type.Unknown;
	}

	if (value.constructor == Array)
	{
		const set = new Set<Type>();

		// If it is an array, there can be anything; we'll check first X cuz of performance.
		for (let item of value.slice(0, ArrayItemsCountToCheckItsType))
		{
			set.add(getTypeOfRuntimeValue(item));
		}

		const valuesTypes = Array.from(set);
		const arrayBuilder = TypeBuilder.createArray();

		if (value.length == 0)
		{
			return arrayBuilder
				.setGenericType(Type.Any)
				.build();
		}

		const unionBuilder = TypeBuilder.createUnion(valuesTypes);

		// If there are more items than we checked, add Unknown type to the union.
		if (value.length > ArrayItemsCountToCheckItsType)
		{
			unionBuilder.addTypes(Type.Unknown);
		}

		return arrayBuilder.setGenericType(unionBuilder.build()).build();
	}

	if (typeof value === "function"
		&& (
			value.prototype == undefined
			|| Object.getOwnPropertyDescriptor(value, "prototype")?.writable === true
		)
	)
	{
		return FunctionBuilder.fromFunction(value);
	}

	return Metadata.resolveType(
		(typeof value === "function" && value.prototype?.[PROTOTYPE_TYPE_PROPERTY]) || value.constructor.prototype[PROTOTYPE_TYPE_PROPERTY]
	);
}