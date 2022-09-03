import {
	PropertyFlags,
	PropertyInfo
}                                from "../declarations";
import { TypeKind }              from "../enums";
import { getTypeOfRuntimeValue } from "../helpers";
import { Metadata }              from "../Metadata";
import { Type }                  from "../Type";
import { ObjectType }            from "../types";
import { TypeBuilderBase }       from "./TypeBuilderBase";

export class ObjectLiteralTypeBuilder extends TypeBuilderBase
{
	private properties: Array<PropertyInfo> = [];

	constructor()
	{
		super();
		this.setName("Object");
	}

	/**
	 *
	 * @param object
	 */
	static fromObject(object: any): Type
	{
		if (!object)
		{
			return Type.Undefined;
		}

		if (object.constructor !== Object)
		{
			return Type.Unknown;
		}

		const builder = new ObjectLiteralTypeBuilder();
		builder.setName(object.constructor.name || "Object");
		const descriptors = Object.getOwnPropertyDescriptors(object);

		for (let prop in descriptors)
		{
			if (descriptors.hasOwnProperty(prop))
			{
				const desc = descriptors[prop];
				const type = getTypeOfRuntimeValue(object[prop]);

				if (desc.get)
				{
					builder.addProperty(
						new PropertyInfo({
							name: prop,
							type: type.id,
							flags: PropertyFlags.Readonly | PropertyFlags.Getter
						})
					);
				}
				if (desc.set)
				{
					builder.addProperty(
						new PropertyInfo({
							name: prop,
							type: type.id,
							flags: PropertyFlags.Setter
						})
					);
				}
				else if (!desc.get && !desc.set)
				{
					builder.addProperty(
						new PropertyInfo({
							name: prop,
							type: type.id,
							flags: desc.writable ? PropertyFlags.None : PropertyFlags.Readonly
						})
					);
				}
			}
		}

		return builder.build();
	}

	/**
	 * Add property
	 * @param description
	 */
	addProperty(description: PropertyInfo)
	{
		this.properties.push(description);
		return this;
	}

	/**
	 * Build Object Literal Type.
	 */
	build(): Type
	{
		const type = new ObjectType({
			kind: TypeKind.Object,
			id: this.fullName,
			name: this.typeName,
			fullName: this.fullName,
			properties: this.properties,
			methods: [],
			indexes: [],
			module: this.moduleReference,
		});

		Metadata.addType(type);

		return type;
	}
}