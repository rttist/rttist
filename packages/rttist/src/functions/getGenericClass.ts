import { CALLSITE_TYPE_ARGS_PROPERTY } from "@rttist/core";
import { TypeReference }               from "../declarations";
import { GenericTypeRegister }         from "../GenericTypeRegister";
import { Type }                        from "../Type";

export function getGenericClass<T>(
	classCtor: { new(...args: any[]): T },
	...typeParameters: Type[]
): Function
{
	if (typeParameters.length === 0)
	{
		const callsiteArgs: TypeReference[] | undefined = (getGenericClass as any)[CALLSITE_TYPE_ARGS_PROPERTY];
		(getGenericClass as any)[CALLSITE_TYPE_ARGS_PROPERTY] = undefined;

		if (callsiteArgs !== undefined && (callsiteArgs.length !== 0 || !!callsiteArgs[0]))
		{
			const type = Reflect.resolveType(callsiteArgs[0]);
			return GenericTypeRegister.getGenericClass(
				classCtor,
				type.isGenericType() ? type.getTypeArguments() : []
			);
		}
	}

	return GenericTypeRegister.getGenericClass(classCtor, typeParameters);
}