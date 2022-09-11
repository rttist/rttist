import { TypeKind }      from "../enums";
import { Type }          from "../Type";
import { ClassType }     from "../types/ClassType";
import { InterfaceType } from "../types/InterfaceType";

const Map: {
	[kind: number]: { new(initializer: any): Type }
} = {
	[TypeKind.Class]: ClassType,
	[TypeKind.Interface]: InterfaceType,
};

export class TypeFactory
{
	create(kind: TypeKind, initializer: any): Type
	{
		const Ctor = Map[kind] || Type;
		return new Ctor(initializer);
	}
}