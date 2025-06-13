import { PROTOTYPE_TYPE_INSTANCE_PROPERTY, PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import { Type } from "./Type";
import { getNativeTypes } from "./native-types";
import type { MetadataLibrary } from "./MetadataLibrary";
import { instanceOfType, instanceOfModule } from "./utils/instanceOf";

export function getTypeOfRuntimeValue(value: any, metadataLibrary: MetadataLibrary): Type {
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
	if (instanceOfType(value)) return Type.Type;
	if (instanceOfModule(value)) return Type.Module;

	if (value.constructor === undefined) {
		return Type.Unknown;
	}

	if (value.constructor === Object) return Type.NonPrimitiveObject;
	if (Array.isArray(value)) return getNativeTypes().AnyArray;

	const typeInstance =
		value.prototype?.[PROTOTYPE_TYPE_INSTANCE_PROPERTY] ||
		(value.constructor.prototype[PROTOTYPE_TYPE_INSTANCE_PROPERTY] as Type | undefined);

	if (typeInstance !== undefined) {
		return typeInstance;
	}

	const typeRef =
		value.prototype?.[PROTOTYPE_TYPE_PROPERTY] ||
		value.constructor.prototype[PROTOTYPE_TYPE_PROPERTY] ||
		value[PROTOTYPE_TYPE_PROPERTY] ||
		undefined;

	if (typeRef !== undefined) {
		return metadataLibrary.resolveType(typeRef);
	}

	return typeof value === "function" ? getNativeTypes().UnknownFunction : Type.Unknown;
}
