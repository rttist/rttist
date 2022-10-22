// import type {
// 	FunctionTypeMetadata,
// 	Signature
// }               from "../declarations";
// import { Type } from "../Type";
//
// export class MethodType extends Type
// {
// 	/**
// 	 * @internal
// 	 */
// 	private readonly _signatures: ReadonlyArray<Signature>;
//
// 	constructor(initializer: FunctionTypeMetadata)
// 	{
// 		super(initializer);
//
// 		this._signatures = Object.freeze(initializer.signatures || []);
// 	}
//
// 	/**
// 	 * Returns array of method signatures.
// 	 */
// 	getSignatures(): ReadonlyArray<Signature>
// 	{
// 		return this._signatures;
// 	}
// }