import { ParameterInfo }   from "../declarations";
import { TypeKind }        from "../enums";
import { Metadata }        from "../Metadata";
import { Module }          from "../Module";
import { Type }            from "../Type";
import { FunctionType }    from "../types/FunctionType";
import { TypeBuilderBase } from "./TypeBuilderBase";

export class FunctionBuilder extends TypeBuilderBase
{
	private parameters: Array<ParameterInfo> = [];
	private returnType: Type = Type.Unknown;

	/**
	 * @internal
	 */
	constructor()
	{
		super();
		this.setName("");
	}

	/**
	 * Create Bu
	 * @param object
	 */
	static fromFunction(object: Function): Type
	{
		if (!object)
		{
			return Type.Undefined;
		}

		const builder = new FunctionBuilder();
		builder.setName(object.name ?? "");

		// TODO: Handle this better.
		const paramsIterator = Array.from(Array(object.length).keys());
		builder.setParameters(paramsIterator.map(i => new ParameterInfo({
			name: "param" + i,
			type: Type.Any.id,
			optional: false
		})));

		builder.setReturnType(Type.Unknown);

		return builder.build();
	}

	public setParameters(parameters: ParameterInfo[])
	{
		this.parameters = parameters;
	}

	public setReturnType(returnType: Type)
	{
		this.returnType = returnType;
	}

	/**
	 * Build Function type.
	 */
	build(): Type
	{
		const type = new FunctionType({
			id: Symbol(),
			kind: TypeKind.Function,
			fullName: this.fullName,
			module: Module.Dynamic.id,
			name: this.typeName,
			parameters: this.parameters,
			typeParameters: [],
			returnType: this.returnType.id,
		});
		
		Metadata.addType(type);
		
		return type;
	}
}