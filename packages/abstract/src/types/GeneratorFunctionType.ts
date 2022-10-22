import type {
	GeneratorFunctionTypeMetadata,
	Signature
}               from "../declarations";
import { Type } from "../Type";

export class GeneratorFunctionType extends Type
{
	/**
	 * @internal
	 */
	private readonly _signatures: ReadonlyArray<Signature>;

	constructor(initializer: GeneratorFunctionTypeMetadata)
	{
		super(initializer);

		this._signatures = Object.freeze(initializer.signatures || []);
	}

	/**
	 * Returns array of method signatures.
	 */
	getSignatures(): ReadonlyArray<Signature>
	{
		return this._signatures;
	}
}