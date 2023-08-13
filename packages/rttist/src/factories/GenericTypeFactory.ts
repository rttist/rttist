import type { Type } from "../Type";
import type { GenericType } from "../types";
import { ClassType } from "../types";
import { TypeKind } from "../enums";
import { MetadataScope } from "../metadata-scope";

let genericTypeCounter = 1;

export class GenericTypeFactory {
	/**
	 * Creates new generic type from generic type declaration.
	 */
	static create(
		genericTypeDefinition: ClassType,
		typeParameters: readonly Type[],
		genericTypeFullName: string
	): GenericType<ClassType> {
		const type = new ClassType({
			kind: TypeKind.Class,
			id: genericTypeCounter++ + "#" + genericTypeFullName,
			name: genericTypeDefinition.name,
			typeArguments: typeParameters.map((tp) => tp.id),
			module: genericTypeDefinition.module.id,
			properties: genericTypeDefinition.getProperties().map((x) => x.metadata),
			indexes: genericTypeDefinition.getIndexes().map((x) => x.metadata),
			methods: genericTypeDefinition.getMethods().map((x) => x.metadata),
			constructors: genericTypeDefinition.getConstructors().map((x) => x.metadata),
			decorators: genericTypeDefinition.getDecorators(),
			ctor: genericTypeDefinition.getCtor,
			extends: genericTypeDefinition.extends?.id,
			exported: genericTypeDefinition.exported,
			implements: genericTypeDefinition.implements.map((t) => t.id),
			nullable: genericTypeDefinition.nullable,
			isGenericTypeDefinition: false,
			genericTypeDefinition: genericTypeDefinition.id,
		});

		MetadataScope.current.addType(type);

		return type as GenericType<ClassType>;
	}
}
