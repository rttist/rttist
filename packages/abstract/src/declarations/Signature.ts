import type { Type }          from "../Type";
import type { ParameterInfo } from "./ParameterInfo";
import type { TypeReference } from "./declarations";
import { Metadata }           from "../Metadata";

export interface SignatureInitializerBase
{
	parameters?: Array<ParameterInfo>;
	typeParameters?: TypeReference[];
	returnType: TypeReference;
}

export abstract class Signature
{
	/**
	 * @internal
	 */
	private readonly _parameters: ReadonlyArray<ParameterInfo>;

	/**
	 * @internal
	 */
	private readonly _returnTypeReference: TypeReference;

	/**
	 * @internal
	 */
	private readonly _typeParametersReference: ReadonlyArray<TypeReference>;

	/**
	 * @internal
	 */
	private _returnType?: Type;

	/**
	 * @internal
	 */
	private _typeParameters?: ReadonlyArray<Type>;

	/**
	 * Return type of the method.
	 */
	get returnType(): Type
	{
		return this._returnType ?? (this._returnType = Metadata.resolveType(this._returnTypeReference));
	}

	/**
	 * @param initializer
	 */
	protected constructor(initializer: SignatureInitializerBase)
	{
		this._parameters = Object.freeze(initializer.parameters || []);
		this._typeParametersReference = initializer.typeParameters || [];
		this._returnTypeReference = initializer.returnType;
	}

	/**
	 * Returns parameters of the signature.
	 */
	getParameters(): ReadonlyArray<ParameterInfo>
	{
		return this._parameters;
	}

	/**
	 * Returns array of type parameters.
	 */
	getTypeParameters(): ReadonlyArray<Type>
	{
		return this._typeParameters?.slice() ?? (this._typeParameters = this._typeParametersReference.map(type => Metadata.resolveType(type)));
	}
}