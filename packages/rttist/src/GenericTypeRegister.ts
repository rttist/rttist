import type { ExpandableMetadataLibrary } from "./MetadataLibrary";
import type { Type } from "./Type";
import { PROTOTYPE_TYPE_INSTANCE_PROPERTY, PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import { getGenericTypeFactory } from "./factories/TypeFactoryProvider";

export class GenericTypeRegister {
	constructor(private readonly metadataLibrary: ExpandableMetadataLibrary) {}

	/**
	 * Classes of dynamically created generic types.
	 * @private
	 */
	private readonly createdTypes: { [fullName: string]: Function } = {};

	/**
	 * Return generic type created from generic type definition and type arguments.
	 * @description Created generic types are cached and stored in metadata library after creation.
	 * @param classCtor
	 * @param typeParameters
	 */
	getGenericClass<T>(
		classCtor: { new (...args: any[]): T },
		typeParameters: readonly Type[]
	): { new (...args: any[]): T } {
		const genericTypeDefinition = this.metadataLibrary.getType(classCtor);

		if (!genericTypeDefinition.isClass()) {
			console.error("GenericTypeRegister.getGenericClass called for type which is not a ClassType.");

			return class Invalid {} as any;
		}

		const id = GenericTypeRegister.getId(genericTypeDefinition, typeParameters);
		let genericClass = this.createdTypes[id];

		if (!genericClass) {
			const name = `${classCtor.name}{${typeParameters.map((p) => p.name).join(",")}}`;

			this.createdTypes[id] = genericClass = {
				[name]: class extends (classCtor as any) {
					// constructor(...args: any[]) {
					// 	super(...args);
					// }
				},
			}[name];

			const type: Type = getGenericTypeFactory().create(id, genericTypeDefinition, typeParameters);

			// Add type into the typelib
			this.metadataLibrary.addType(type);

			genericClass.prototype[PROTOTYPE_TYPE_INSTANCE_PROPERTY] = type;
			genericClass.prototype[PROTOTYPE_TYPE_PROPERTY] = type.id;
		}

		return genericClass as any;
	}

	/**
	 * Generates the "fullName" for the generic type created from generic type definition and type arguments.
	 * @param genericTypeDefinition
	 * @param typeParameters
	 * @private
	 */
	private static getId(genericTypeDefinition: Type, typeParameters: readonly Type[]) {
		return `${genericTypeDefinition.id}{${typeParameters.map((tp) => tp.id).join(",")}}`;
	}
}
