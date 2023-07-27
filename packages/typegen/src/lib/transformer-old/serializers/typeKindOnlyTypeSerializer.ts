import { TypeSerializer }           from "../declarations/general";
import { NativeBaseTypeProperties } from "../declarations/TypeProperties";

export const typeKindOnlyTypeSerializer = function(properties: NativeBaseTypeProperties)
{
	if (properties.kind > 255)
	{
		throw new Error("TypeKind value overflowed one byte.");
	}

	return [properties.kind];
} as TypeSerializer;