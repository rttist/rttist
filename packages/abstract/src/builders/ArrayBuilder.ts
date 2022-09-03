import { TypeKind }        from "../enums";
import { Metadata }        from "../Metadata";
import { Type }            from "../Type";
import {
	ClassType,
	GenericType
} from "../types";
import { TypeBuilderBase } from "./TypeBuilderBase";

export class ArrayTypeBuilder extends TypeBuilderBase
{
	private type?: Type;

	constructor()
	{
		super();
		this.typeName = "dynamic<Array>";
	}

	/**
	 * Set generic type of the Array
	 * @param type
	 */
	setGenericType(type: Type)
	{
		this.type = type;
		return this;
	}

	/**
	 * @inheritDoc
	 */
	build(): GenericType<ClassType>
	{
		const type = new ClassType({
			id: this.fullName,
			kind: TypeKind.Array,
			name: this.typeName,
			fullName: this.fullName,
			typeParameters: [this.type?.id ?? Type.Any.id],
			ctor: () => Promise.resolve(Array),
			ctorSync: () => Array,
			module: this.moduleReference,
			constructors: [],
			decorators: [],
			methods: [],
			properties: [],
			indexes: []
		});

		Metadata.addType(type);

		return type;
	}
}