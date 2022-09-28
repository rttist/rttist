import { Config }            from "../config/Config";
import {
	writeFileSync,
	readFileSync,
	mkdirSync
}                            from "fs";
import {
	join,
	dirname
}                            from "path";
import * as ts               from "typescript";
import { DependencyManager } from "../dependencies/DependencyManager";
import { MetadataLibrary }   from "./MetadataLibrary";

/**
 * Emitter use to write metadata into library file.
 */
export class LibraryFileEmitter
{
	constructor(
		private readonly config: Config,
		private readonly dependencyManager: DependencyManager,
		private readonly metadataLibrary: MetadataLibrary
	)
	{
	}

	emit(metadataExpression: ts.Expression): Promise<void>
	{
		return this.write(metadataExpression);
	}

	private write(metadataExpression: ts.Expression): Promise<void>
	{
		const typelibOutputPath = this.config.metadataTypelibPath;
		const transpiledTypelib = this.getTranspiledTypelib(metadataExpression, typelibOutputPath);

		// Write typelib
		mkdirSync(dirname(typelibOutputPath), { recursive: true });
		writeFileSync(typelibOutputPath, transpiledTypelib, { encoding: "utf8", flag: "w" });

		// Write index
		const indexOutputPath = this.config.metadataIndexPath;
		mkdirSync(dirname(indexOutputPath), { recursive: true });
		writeFileSync(indexOutputPath, this.getIndex(), { encoding: "utf8", flag: "w" });

		return Promise.resolve();
		// TODO: Use async write. Currently I have issue with it. Node exists before its Promise is resolved so file is usually created but empty and no .then() nor .catch() is executed.
		// await writeFile(fileName, transpiledSource.outputText, { encoding: "utf8", flag: "w" });
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
				ts.factory.createImportDeclaration(
					undefined,
					undefined,
					ts.factory.createStringLiteral("@rttist/abstract")
				),
				...this.createDependantTypeLibsImports(),
				ts.factory.createExpressionStatement(metadataExpression)
			],
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);
	}

	private getTranspiledTypelib(metadataExpression: ts.Expression, fileName: string): string
	{
		const sourceFile = this.createSourceFile(metadataExpression);
		const source = this.printToTypeScriptCode(sourceFile);

		let transpiledTypelib = ts.transpileModule(source, {
			fileName: fileName,
			compilerOptions: {
				...this.config.compilerOptions,
				declaration: false,
				strict: false,
				sourceMap: false,
				importHelpers: false,
				skipLibCheck: true,
				skipDefaultLibCheck: true
			}
		}).outputText;

		if (this.config.encode)
		{
			const stub = readFileSync(
				join(__dirname, "..", "..", "templates", "typelib.template.ts"),
				{ encoding: "utf-8" }
			);
			transpiledTypelib = transpiledTypelib + stub;
		}

		return transpiledTypelib;
	}

	private getIndex()
	{
		const modules = Array.from(this.metadataLibrary.getModules()).map(module => {
			const props = module.getModuleProperties();
			const types = (props.types || [])
				?.filter(type => type.id !== undefined)
				.map(type => `"${type.id}"`);

			return `{"module": "${props.id}","types":[\n\t${types.join(",\n\t")}\n ]}`;
		});
		return "[\n " + modules.join(",\n ") + "]";
	}

	/**
	 * Generate import declarations for all the dependencies with typelibs.
	 * @private
	 */
	private createDependantTypeLibsImports()
	{
		return this.dependencyManager.dependencies
			.filter(d => d.typelibPath)
			.map(d => ts.factory.createImportDeclaration(
				undefined,
				undefined,
				ts.factory.createStringLiteral(d.typelibPath!)
			));
	}
}