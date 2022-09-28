import * as ts               from "typescript";
import { SourceFileContext } from "../contexts/SourceFileContext";

/**
 * Interface for Plugins visiting and transforming SourceFiles.
 */
export interface SourceFileVisitorPlugin
{
	visit(sourceFile: ts.SourceFile, context: SourceFileContext): ts.SourceFile;
}


// export interface Plugin {
// 	/**
// 	 * Visit SourceFile, allowing transformations of the SourceFile. 
// 	 * @param sourceFile
// 	 * @param context
// 	 */
// 	visit?(sourceFile: ts.SourceFile, context: SourceFileContext): ts.SourceFile;
//
// 	/**
// 	 * Returns import declarations for the typelib SourceFile.
// 	 */
// 	getImports?(): ts.ImportDeclaration[];
//
// 	/**
// 	 * Returns JS code which will be appended right after imports. 
// 	 */
// 	getInitScripts?(): string;
//	
// 	/**
// 	 * Returns JS code which will be appended to the end of the typelib..
// 	 */
// 	getEndScripts?(): string;
//	
// 	// /**
// 	//  * Transform SourceFile of typelib.
// 	//  * @param sourceFile
// 	//  */
// 	// updateTypeLib?(sourceFile: ts.SourceFile): ts.SourceFile;
// }