import { TransformerContext } from "../contexts/TransformerContext";
import { log }                from "../log";
import { writeFile }          from "fs/promises";
import { writeFileSync }      from "fs";
import { join }               from "path";
import * as ts                from "typescript";

/**
 * Emitter use to write metadata into library file.
 */
export class LibraryFileEmitter
{
	private readonly transformerContext: TransformerContext;


	constructor(transformerContext: TransformerContext)
	{
		this.transformerContext = transformerContext;
	}

	async emit(metadataExpression: ts.Expression): Promise<void>
	{

		// // TYPELIB - add import of metadata library
		// if (config.metadataType == MetadataTypeValues.typeLib)
		// {
		// log.debug("Generating metadata file.");

		// 		const propertiesStatements: Array<[number, ts.ObjectLiteralExpression]> = [];
		// 		const typeIdUniqueObj: { [key: number]: boolean } = {};
		//
		// 		for (let [typeId, properties] of sourceFileContext.typesMetadata)
		// 		{
		// 			if (typeIdUniqueObj[typeId])
		// 			{
		// 				continue;
		// 			}
		//
		// 			typeIdUniqueObj[typeId] = true;
		// 			propertiesStatements.push([typeId, properties]);
		// 		}
		//
		// 		const typeCtor = new Set<ts.PropertyAccessExpression>();
		// 		for (let ctor of sourceFileContext.typesCtors)
		// 		{
		// 			typeCtor.add(ctor);
		// 		}
		//

		await this.write(metadataExpression);
		// }
		// else if (config.metadataType == MetadataTypeValues.inline)
		// {
		// 	console.warn("Mode 'inline' is not implemented yet.");
		//
		// 	//const types = sourceFileContext.metadata.getInFileTypes(sourceFileContext.sourceFile);
		//
		// 	// for (let moduleMetadata of modules)
		// 	// {
		// 	// 	statements.push(ts.factory.createExpressionStatement(
		// 	// 		sourceFileContext.metaWriter.factory.addDescriptionToStore(typeId, properties)
		// 	// 	));
		// 	// }
		// }
	}

	private async write(metadataExpression: ts.Expression): Promise<void>
	{
		const typelibOutputPath = this.getTypelibOutputPath();
		const transpiledTypelib = this.getTranspiledTypelib(metadataExpression, typelibOutputPath);

		// Write typelib
		writeFileSync(typelibOutputPath, transpiledTypelib.outputText, { encoding: "utf8", flag: "w" });

		// Write index
		const indexOutputPath = this.getIndexOutputPath();
		writeFileSync(indexOutputPath, this.getIndex(), { encoding: "utf8", flag: "w" });

		return Promise.resolve();
		// TODO: Use async write. Currently I have issue with it. Node exists before its Promise is resolved so file is usually created but empty and no .then() nor .catch() is executed.
		// await writeFile(fileName, transpiledSource.outputText, { encoding: "utf8", flag: "w" });
	}

	public getTypelibOutputPath()
	{
		return join(this.transformerContext.config.outDir, this.transformerContext.config.metadataTypelibPath);
	}

	public getIndexOutputPath()
	{
		return join(this.transformerContext.config.outDir, this.transformerContext.config.metadataIndexPath);
	}

	/**
	 * Return string with TypeScript code representing given SourceFile node.
	 * @param sourceFile
	 * @private
	 */
	private printToTypeScriptCode(sourceFile: ts.SourceFile)
	{
		const tsPrinter = ts.createPrinter();
		return tsPrinter.printFile(sourceFile);
	}

	/**
	 * Create SourceFile node with metadata library.
	 * @param metadataExpression
	 */
	private createSourceFile(metadataExpression: ts.Expression)
	{
		return ts.factory.createSourceFile(
			[
				// TODO: Add import `import from "@rtti/abstract";` or `require("@rtti/abstract")` based on ESM
				ts.factory.createImportDeclaration(undefined, undefined, ts.factory.createStringLiteral("@rtti/abstract")),
				ts.factory.createExpressionStatement(metadataExpression)
			],
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);
	}

	private getTranspiledTypelib(metadataExpression: ts.Expression, fileName: string): ts.TranspileOutput
	{
		const sourceFile = this.createSourceFile(metadataExpression);
		const source = this.printToTypeScriptCode(sourceFile);

		return ts.transpileModule(source, {
			fileName: fileName,
			compilerOptions: this.transformerContext.config.compilerOptions
		});
	}

	private getIndex()
	{
		const modules = Array.from(this.transformerContext.metadata.getModules()).map(module => {
			const props = module.getModuleProperties();
			const types = (props.types || [])
				?.filter(type => type.id !== undefined)
				.map(type => `"${type.id}"`);
			
			return `{"module": "${props.id}","types":[\n\t${types.join(",\n\t")}\n ]}`;
		});
		return "[\n " + modules.join(",\n ") + "]";
	}
}