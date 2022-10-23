import type { Type }                  from "../Type";
import type { SignatureMetadataBase } from "../declarations";
import { LazyType }                   from "../utils/LazyType";
import { LazyTypeArray }              from "../utils/LazyTypeArray";
import { ParameterInfo }              from "./ParameterInfo";

export class SignatureInfo
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
	 * @internal
	 */
	readonly metadata: SignatureMetadataBase;

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
	constructor(initializer: SignatureMetadataBase)
	{
		this.metadata = initializer;
		this._parameters = Object.freeze((initializer.parameters || []).map(meta => new ParameterInfo(meta)));
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