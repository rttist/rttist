import type { Context }    from "../contexts/Context";
import * as ts             from "typescript";
import { MetadataSource }  from "../declarations/TypeProperties";
import { MetadataContext } from "./MetadataContext";

export interface Plugin
{
	/**
	 * Visit SourceFile, allowing transformations of the SourceFile.
	 * @param sourceFile
	 * @param context
	 */
	visit?(sourceFile: ts.SourceFile, context: Context): ts.SourceFile;

	/**
	 * Returns import declarations for the typelib SourceFile.
	 */
	getImports?(): Array<ts.ImportDeclaration | ts.Statement>;

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