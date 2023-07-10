import { TypeKind }                   from "rttist";
import { TypeSerializer }             from "../declarations/general";
import { TypePropertiesWithId }       from "../declarations/TypeProperties";
import { log }                        from "../logging";
import { typeKindOnlyTypeSerializer } from "./typeKindOnlyTypeSerializer";

const map: { [typeKind: number]: TypeSerializer } = {
	[TypeKind.Any]: typeKindOnlyTypeSerializer,
	[TypeKind.Unknown]: typeKindOnlyTypeSerializer,
	[TypeKind.Void]: typeKindOnlyTypeSerializer,
	[TypeKind.Never]: typeKindOnlyTypeSerializer,
	[TypeKind.Null]: typeKindOnlyTypeSerializer,
	[TypeKind.Undefined]: typeKindOnlyTypeSerializer,
	[TypeKind.NonPrimitiveObject]: typeKindOnlyTypeSerializer,
	[TypeKind.String]: typeKindOnlyTypeSerializer,
	[TypeKind.Number]: typeKindOnlyTypeSerializer,
	[TypeKind.BigInt]: typeKindOnlyTypeSerializer,
	[TypeKind.Boolean]: typeKindOnlyTypeSerializer,
	[TypeKind.True]: typeKindOnlyTypeSerializer,
	[TypeKind.False]: typeKindOnlyTypeSerializer,
	[TypeKind.Date]: typeKindOnlyTypeSerializer,
	[TypeKind.Error]: typeKindOnlyTypeSerializer,
	[TypeKind.Symbol]: typeKindOnlyTypeSerializer,
	[TypeKind.RegExp]: typeKindOnlyTypeSerializer,
	[TypeKind.Int8Array]: typeKindOnlyTypeSerializer,
	[TypeKind.Uint8Array]: typeKindOnlyTypeSerializer,
	[TypeKind.Uint8ClampedArray]: typeKindOnlyTypeSerializer,
	[TypeKind.Int16Array]: typeKindOnlyTypeSerializer,
	[TypeKind.Uint16Array]: typeKindOnlyTypeSerializer,
	[TypeKind.Int32Array]: typeKindOnlyTypeSerializer,
	[TypeKind.Uint32Array]: typeKindOnlyTypeSerializer,
	[TypeKind.Float32Array]: typeKindOnlyTypeSerializer,
	[TypeKind.Float64Array]: typeKindOnlyTypeSerializer,
	[TypeKind.BigInt64Array]: typeKindOnlyTypeSerializer,
	[TypeKind.BigUint64Array]: typeKindOnlyTypeSerializer,
	[TypeKind.ArrayBuffer]: typeKindOnlyTypeSerializer,
	[TypeKind.SharedArrayBuffer]: typeKindOnlyTypeSerializer,
	[TypeKind.FunctionType]: typeKindOnlyTypeSerializer,
	[TypeKind.ObjectType]: typeKindOnlyTypeSerializer,
	[TypeKind.Atomics]: typeKindOnlyTypeSerializer,
	[TypeKind.DataView]: typeKindOnlyTypeSerializer,
	[TypeKind.ArrayDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.ReadonlyArrayDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.MapDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.WeakMapDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.SetDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.WeakSetDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.PromiseDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.GeneratorDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.AsyncGeneratorDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.IteratorDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.IterableDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.IterableIteratorDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.AsyncIteratorDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.AsyncIterableDefinition]: typeKindOnlyTypeSerializer,
	[TypeKind.AsyncIterableIteratorDefinition]: typeKindOnlyTypeSerializer,
};

export function serializeType(properties: TypePropertiesWithId)
{
	const serializer = map[properties.kind];

	if (!serializer)
	{
		log.error("No serializer found for kind " + properties.kind);
		return new Uint8Array([TypeKind.Unknown]);
	}

	return serializer(properties);
}