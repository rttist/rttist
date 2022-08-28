import { TypeKind }    from "../enums";
import { Metadata }    from "../Metadata";
import { Type }        from "../Type";
import { ClassType }   from "../types/ClassType";
import { GenericType } from "../types/GenericType";

export class GenericTypeFactory
{
	/**
	 * Creates new generic type from generic type declaration.
	 */
	static create(genericTypeDefinition: ClassType, typeParameters: Type[], genericTypeFullName: string): GenericType<ClassType>
	{
		const type = new ClassType({
			kind: TypeKind.Class,
			id: Symbol(),
			name: genericTypeDefinition.name,
			fullName: genericTypeFullName,
			typeParameters: typeParameters.map(tp => tp.id),
			module: genericTypeDefinition.module.id,
			properties: genericTypeDefinition.getProperties(),
			indexes: genericTypeDefinition.getIndexes(),
			methods: genericTypeDefinition.getMethods(),
			constructors: genericTypeDefinition.getConstructors(),
			decorators: genericTypeDefinition.getDecorators(),
			ctor: genericTypeDefinition.getCtor,
			baseType: genericTypeDefinition.baseType?.id,
			exported: genericTypeDefinition.exported,
			interface: genericTypeDefinition.interface?.id
		});

		Metadata.addType(type);

		return type;
	}
}