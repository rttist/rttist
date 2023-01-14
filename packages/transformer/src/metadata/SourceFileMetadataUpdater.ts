import { createImport }     from "../ast-utils/createImport";
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

		return updateSourceFile(
			sourceFile,
			[
				createImport(undefined, tsLibPath)
			]
		);
	}
}