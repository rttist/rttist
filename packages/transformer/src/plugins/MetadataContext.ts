import * as ts from "typescript";

export type MetadataContext = {
	/**
	 * Identifier of the imported Metadata object from the "rttist" package.
	 */
	metadataIdentifier: ts.Identifier;

	/**
	 * Identifier of the Module class imported from the "rttist" package.
	 */
	moduleClassIdentifier: ts.Identifier;

	/**
	 * Identifier of the Type class imported from the "rttist" package.
	 */
	typeClassIdentifier: ts.Identifier;
};