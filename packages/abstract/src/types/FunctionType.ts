import type {
	TypeReference,
	FunctionTypeMetadata,
	ParameterInfo
}                           from "../declarations";
import { Metadata }         from "../Metadata";
import { Type }             from "../Type";
import type { GenericType } from "./GenericType";

export class FunctionType extends Type
{
	private readonly _returnTypeReference: TypeReference;

	private readonly _parameters: Array<ParameterInfo>;
	private _returnType?: Type;

	/**
	 * Return type of the function.
	 */
	get returnType(): Type
	{
		return this._returnType ?? (this._returnType = Metadata.resolveType(this._returnTypeReference));
	}

	constructor(initializer: FunctionTypeMetadata)
	{
		super(initializer);

		this._parameters = initializer.parameters;
		this._returnTypeReference = initializer.returnType;
	}

	/**
	 * Return parameters.
	 */
	getParameters(): ReadonlyArray<ParameterInfo>
	{
		return this._parameters.slice();
	}

	/**
	 * @inheritDoc
	 */
	isGenericType(): this is GenericType<FunctionType>
	{
		return super.isGenericType();
	}
}