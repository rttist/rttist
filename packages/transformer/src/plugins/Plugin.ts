import * as ts               from "typescript";
import { SourceFileContext } from "../contexts/SourceFileContext";
import { MetadataSource }    from "../declarations/TypeProperties";
import { MetadataContext }   from "./MetadataContext";

export interface Plugin
{
	/**
	 * Visit SourceFile, allowing transformations of the SourceFile.
	 * @param sourceFile
	 * @param context
	 */
	visit?(sourceFile: ts.SourceFile, context: SourceFileContext): ts.SourceFile;

	/**
	 * Returns import declarations for the typelib SourceFile.
	 */
	getImports?(): ts.ImportDeclaration[];

	// /**
	//  * Returns JS code which will be appended right after imports.
	//  */
	// getInitScripts?(): string;

	/**
	 * Create expression registering
	 */
	createModuleRegistrars?(metadata: MetadataSource, context: MetadataContext): ts.Statement[];

	/**
	 * Returns JS code which will be appended to the end of the typelib..
	 */
	getEndScripts?(): string;
}