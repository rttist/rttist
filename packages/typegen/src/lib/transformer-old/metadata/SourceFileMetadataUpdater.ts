import path                from "path";
import * as ts             from "typescript";
import { createImport }    from "../ast-utils/createImport";
import type { Config }     from "../config/Config";
import { getRelativePath } from "../utils/getRelativePath";

const RttistTypelibModuleSpecifierRegex = /(npm:)?rttist\/typelib(\/index(\.(js|ts))?)?$/;

export class SourceFileMetadataUpdater
{
	constructor(
		private readonly config: Config
	)
	{
	}

	addMetadataToSourceFileIfRequired(sourceFile: ts.SourceFile): ts.SourceFile
	{
		const importsIndex = sourceFile.statements.findIndex(statement => !ts.isImportDeclaration(statement));

		if (importsIndex === -1)
		{
			return sourceFile;
		}

		const tsLibPath = getRelativePath(path.dirname(sourceFile.fileName), this.config.metadataTypelibSourcePath);

		// TODO: Handle access to in-file not exported constructors.

		const statements = (sourceFile.statements.slice(0, importsIndex) as ts.ImportDeclaration[])
			.map(importDeclaration => ts.isStringLiteral(importDeclaration.moduleSpecifier) &&
				RttistTypelibModuleSpecifierRegex.test(importDeclaration.moduleSpecifier.text)
					?
					// We don't use the import, it's just side-effect,
					// but it is required by TS to have named import for NodeNext; it fails otherwise.
					createImport(ts.factory.createIdentifier("___metadataImport___"), tsLibPath, this.config)
					: importDeclaration
			);

		return ts.factory.updateSourceFile(sourceFile, [
			...statements,
			...sourceFile.statements.slice(importsIndex)
		]);


		// const tsLibPath = getRelativePath(path.dirname(sourceFile.fileName), this.config.metadataTypelibSourcePath);
		//
		// return updateSourceFile(
		// 	sourceFile,
		// 	[
		// 		// We don't use the import, it's just side-effect,
		// 		// but it is required by TS to have named import for NodeNext; it fails otherwise.
		// 		createImport(ts.factory.createIdentifier("___metadataImport___"), tsLibPath)
		// 	]
		// );
	}
}