import { PROTOTYPE_TYPE_PROPERTY }  from "@rtti/core";
import { GenericTypeFactory }       from "./factories/GenericTypeFactory";
import { resolveSingletonInstance } from "./helpers";
import type { Type }                from "./Type";

class Register
{
	/**
	 * Classes of dynamically created generic types.
	 * @private
	 */
	private readonly createdTypes: { [fullName: string]: Function } = {};

	/**
	 * Generates the "fullName" for the generic type created from generic type definition and type arguments.
	 * @param genericTypeDefinition
	 * @param typeParameters
	 * @private
	 */
	private getFullName(genericTypeDefinition: Type, typeParameters: Type[])
	{
		return genericTypeDefinition.fullName + "{" + typeParameters.map(tp => tp.fullName).join(",") + "}";
	}

	/**
	 * Return generic type created from generic type definition and type arguments.
	 * @description Created generic types are cached and stored in metadata library after creation.
	 * @param classCtor
	 * @param typeParameters
	 */
	getGenericClass<T extends { new(...args: any[]): any }>(classCtor: T, typeParameters: Type[]): T
	{
		const genericTypeDefinition = Reflect.getType(classCtor);

		if (!genericTypeDefinition.isClass())
		{
			console.error("GenericTypeRegister.getGenericClass called for type which is not a ClassType.");

			return class Invalid
			{
			} as T;
		}

		const fullName = this.getFullName(genericTypeDefinition, typeParameters);
		let genericClass: T = this.createdTypes[fullName] as T;

		if (!genericClass)
		{
			const name = classCtor.name + "{}";

			this.createdTypes[fullName] = genericClass = {
				[name]: class extends classCtor
				{
					constructor(...args: any[])
					{
						super(...args);
						// this.__getType = () => {
						// 	return Reflect.getType(this);
						// }
					}
				}
			}[name];

			genericClass.prototype[PROTOTYPE_TYPE_PROPERTY] = GenericTypeFactory.create(genericTypeDefinition, typeParameters, fullName);
		}

		return genericClass;
	}
}

export const GenericTypeRegister = resolveSingletonInstance("@rtti/abstract/GenericTypeRegister", Register);