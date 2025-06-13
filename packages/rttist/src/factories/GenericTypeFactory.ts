import type { ClassTypeMetadata } from "../declarations";
import type { Type } from "../Type";
import type { GenericType } from "../types";
import { ClassType } from "../types";
import { TypeKind } from "../enums";

let genericTypeCounter = 1;

type RequiredWithPossibleUndefined<T> = {
	[P in keyof Required<T>]: T[P];
};

export class GenericTypeFactory {
	/**
	 * Creates new generic type from generic type declaration.
	 */
	static create(
		id: string,
		genericTypeDefinition: ClassType,
		typeParameters: readonly Type[]
	): GenericType<ClassType> {
		const type = new ClassType({
			kind: TypeKind.Class,
			id: `${genericTypeCounter++}#${id}`,
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
			abstract: genericTypeDefinition.abstract,
		} satisfies RequiredWithPossibleUndefined<ClassTypeMetadata>);

		return type as GenericType<ClassType>;
	}
}
