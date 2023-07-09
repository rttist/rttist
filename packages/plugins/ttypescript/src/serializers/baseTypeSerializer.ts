import { TypeIdentifier }              from "rttist";
import { TypeSerializer }              from "../declarations/general";
import { NonNativeBaseTypeProperties } from "../declarations/TypeProperties";
import { encodeString }                from "../types/encodeString";
import { serializeTypeReference }      from "./serializeTypeReference";

export const baseTypeSerializer = function (prop: NonNativeBaseTypeProperties & { id: TypeIdentifier })
{
	if (prop.kind > 255)
	{
		throw new Error("TypeKind value overflowed one byte.");
	}

	const hasTypeArgs = ~~(prop.typeArguments?.length! > 0);
	const hasGenericTypeDefinition = ~~(prop.genericTypeDefinition !== undefined);

	const data = [
		// [0] Kind
		prop.kind,
		// [1] Flags:
		(
			// exported,
			(~~(prop.exported ?? 0))
			// nullable,
			| (~~(prop.nullable ?? 0)) << 1
			// has some type parameters,
			| hasTypeArgs << 2
			// is generic type definition
			| (~~(prop.isGenericTypeDefinition ?? 0) << 3)
			// has generic type definition reference
			| (hasGenericTypeDefinition << 4)
		),
		// [3+] Type ID, finished by zero
		...encodeString(prop.id),
		0,
		// [] Type name, finished by zero
		...encodeString(prop.name),
		0,
		// [] Module ID, finished by zero
		...encodeString(prop.module ?? ""),
		0
	];

	if (hasTypeArgs === 1)
	{
		// [] Number of type parameters
		data.push(prop.typeArguments!.length);

		// [] Type reference
		prop.typeArguments!.forEach(typeArg => {
			data.push(...serializeTypeReference(typeArg));
		});
	}

	if (hasGenericTypeDefinition === 1)
	{
		// [] Type reference
		data.push(...serializeTypeReference(prop.genericTypeDefinition!));
	}

	return data;
} as TypeSerializer;