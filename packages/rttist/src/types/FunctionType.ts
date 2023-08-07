import type { FunctionTypeMetadata } from "../declarations";
import type { SignatureInfo } from "../infos";
import type { MetadataLibrary } from "../Metadata";
import { Type } from "../Type";
import { mapSignatures } from "../utils/mappers";

export class FunctionType extends Type {
	/**
	 * @internal
	 */
	private readonly _signatures: ReadonlyArray<SignatureInfo>;

	constructor(initializer: FunctionTypeMetadata, metadataLibrary: MetadataLibrary) {
		super(initializer, metadataLibrary);

		this._signatures = mapSignatures(initializer, metadataLibrary);
	}

	/**
	 * Returns array of method signatures.
	 */
	getSignatures(): ReadonlyArray<SignatureInfo> {
		return this._signatures;
	}
}
