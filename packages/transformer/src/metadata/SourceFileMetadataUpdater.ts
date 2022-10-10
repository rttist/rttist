import type { Config }      from "../config/Config";
import * as ts              from "typescript";
import path                 from "path";
import { updateSourceFile } from "../transformers/updateSourceFile";

export class SourceFileMetadataUpdater
{
	constructor(
		private readonly config: Config
	)
	{
	}

	addMetadataToSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	{
		// TODO: Handle access to in-file not exported constructors.

		let tsLibPath = path.relative(
			path.dirname(sourceFile.fileName),
			this.config.metadataTypelibVirtualPath
		)
			.replace(/\\/g, "/");

		if (tsLibPath.charAt(0) !== ".")
		{
			tsLibPath = "./" + tsLibPath;
		}
		
		// TODO: We have to create require() or import() based on config. 
		//  TS will not transform import() to require if there is no other import in the file, 
		//  isn't it bug?

		return updateSourceFile(
			sourceFile,
			[
				ts.factory.createImportDeclaration(
					undefined,
					undefined,
					ts.factory.createStringLiteral(tsLibPath)
				)
			]
		);
	}
}