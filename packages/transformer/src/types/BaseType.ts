import {
	NativeTypeKind,
	NativeTypes,
	TypeKind
}                       from "@rttist/abstract";
import { encode }       from "base32768";
import {
	BaseTypeProperties,
	NativeBaseTypeProperties,
	NonNativeBaseTypeProperties,
	TypeProperties
}                       from "../declarations/TypeProperties";
import { encodeString } from "./encodeString";

const NativeTypeKinds: Set<NativeTypeKind> = new Set(Object.keys(NativeTypes).map(key => Number(key)));

export class BaseType
{
	constructor(public readonly properties: BaseTypeProperties)
	{
	}

	serializer(): string
	{
		const prop: NonNativeBaseTypeProperties | NativeBaseTypeProperties = this.properties as any;

		if (isNative(prop))
		{
			return encode([
				prop.kind
			] as any);
		}
		
		new Uint8Array();

		return encode([
			prop.kind,
			(
				(~~(prop.exported ?? 0))
				| (~~(prop.nullable ?? 0)) << 1
				| (~~(prop.isGenericTypeDefinition ?? 0) << 2)
			),
			...encodeString(prop.id),
			0,
			...encodeString(prop.name),
			0,
			...encodeString(prop.module ?? ""),
			0,
			
		] as any);
	}
}

function isNative(properties: TypeProperties): properties is NativeBaseTypeProperties
{
	return NativeTypeKinds.has(properties.kind as any);
}