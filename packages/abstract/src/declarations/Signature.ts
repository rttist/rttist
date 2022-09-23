import type { Type }          from "../Type";
import { LazyType }           from "../utils/LazyType";
import { LazyTypeArray }      from "../utils/LazyTypeArray";
import type { TypeReference } from "./declarations";
import type { ParameterInfo } from "./ParameterInfo";

export interface SignatureInitializerBase
{
	parameters?: Array<ParameterInfo>;
	typeParameters?: TypeReference[];
	returnType: TypeReference;
}

export class Signature
{
	/**
	 * @internal
	 */
	private readonly _parameters: ReadonlyArray<ParameterInfo>;

	/**
	 * @internal
	 */
	private readonly _returnTypeRef: LazyType;

	/**
	 * @internal
	 */
	private readonly _typeParametersRef: LazyTypeArray;

	/**
	 * Return type of the method.
	 */
	get returnType(): Type
	{
		return this._returnTypeRef.type;
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: SignatureInitializerBase)
	{
		this._parameters = Object.freeze(initializer.parameters || []);
		this._typeParametersRef = new LazyTypeArray(initializer.typeParameters || []);
		this._returnTypeRef = new LazyType(initializer.returnType);
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
		return this._typeParametersRef.types;
	}
}