import path                 from "path";
import * as ts              from "typescript";
import { createImport }     from "../ast-utils/createImport";
import type { Config }      from "../config/Config";
import { updateSourceFile } from "../transformers/updateSourceFile";
import { getRelativePath }  from "../utils/getRelativePath";

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

		const tsLibPath = getRelativePath(path.dirname(sourceFile.fileName), this.config.metadataTypelibVirtualPath);

		return updateSourceFile(
			sourceFile,
			[
				// We don't use the import, it's just side-effect, 
				// but it is required by TS to have named import for NodeNext; it fails otherwise.
				createImport(ts.factory.createIdentifier("___metadataImport___"), tsLibPath)
			]
		);
	}
}