import { TypeKind } from "../enums";
import { Metadata } from "../Metadata";
import { Type }     from "../Type";
import {
	ClassType,
	GenericType
}                   from "../types";

let genericTypeCounter = 1;

export class GenericTypeFactory
{
	/**
	 * Creates new generic type from generic type declaration.
	 */
	static create(
		genericTypeDefinition: ClassType,
		typeParameters: Type[],
		genericTypeFullName: string
	): GenericType<ClassType>
	{
		const type = new ClassType({
			kind: TypeKind.Class,
			id: (genericTypeCounter++) + "#" + genericTypeFullName,
			name: genericTypeDefinition.name,
			typeArguments: typeParameters.map(tp => tp.id),
			module: genericTypeDefinition.module.id,
			properties: genericTypeDefinition.getProperties(),
			indexes: genericTypeDefinition.getIndexes(),
			methods: genericTypeDefinition.getMethods(),
			constructors: genericTypeDefinition.getConstructors(),
			decorators: genericTypeDefinition.getDecorators(),
			ctor: genericTypeDefinition.getCtor,
			extends: genericTypeDefinition.extends?.id,
			exported: genericTypeDefinition.exported,
			implements: genericTypeDefinition.implements.map(t => t.id),
			nullable: genericTypeDefinition.nullable,
			isGenericTypeDefinition: false,
			genericTypeDefinition: genericTypeDefinition.id
		});

		Metadata.addType(type);

		return type as GenericType<ClassType>;
	}
}