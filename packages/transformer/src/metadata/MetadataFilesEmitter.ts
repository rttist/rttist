import {
	mkdirSync,
	writeFileSync
}                             from "fs";
import { dirname }            from "path";
import * as ts                from "typescript";
import { Config }             from "../config/Config";
import { EmitType }           from "../declarations/EmitType";
import { MetadataSource }     from "../declarations/TypeProperties";
import { DependencyManager }  from "../dependencies/DependencyManager";
import { MetadataContext }    from "../plugins";
import { toExpression }       from "../utils/toExpression";
import { MetadataLibrary }    from "./MetadataLibrary";

/**
 * Emitter used for creating metadata typelib and index file.
 */
export class MetadataFilesEmitter
{
	constructor(
		private readonly config: Config,
		private readonly dependencyManager: DependencyManager,
		private readonly metadataLibrary: MetadataLibrary
	)
	{
	}

	emit(metadata: MetadataSource)
	{
		// if (generated)
		// {
		// 	return;
		// }

		// Create MetadataContext for plugins
		const metadataContext: MetadataContext = {
			metadataIdentifier: ts.factory.createIdentifier("Metadata"),
			moduleClassIdentifier: ts.factory.createIdentifier("Module"),
			typeClassIdentifier: ts.factory.createIdentifier("Type"),
		};

		const sourceFile = this.createSourceFile(metadata, metadataContext);

		// EMIT: TS
		if (this.config.emit === EmitType.TypeScript)
		{
			const typescriptTypelib = this.printToTypeScriptCode(sourceFile);

			this.write(
				typescriptTypelib,
				this.config.metadataTypelibSourcePath
			);
			return;
		}

		// EMIT: JS

		// const fileName = this.config.metadataTypelibSourcePath;

		// // Add typelib to filenames.
		// this.config.parsedCommandLine?.fileNames.push(this.config.metadataTypelibSourcePath);

		// TransformerContext.instance.program.emit(
		// 	ts.createSourceFile(
		// 		fileName,
		// 		// TODO: Emit metadata right here; But there is some issue, because it will fail for complex TS.
		// 		"",
		// 		ts.ScriptTarget.ES5,
		// 		true,
		// 		ts.ScriptKind.TS
		// 	)
		// );

		// generated = true;

		const typelibOutputPath = this.config.metadataTypelibPath;

		this.write(
			this.transpile(sourceFile, typelibOutputPath),
			typelibOutputPath
		);
	}

	private write(typelibText: string, typelibOutputPath: string)
	{
		// Write typelib
		mkdirSync(dirname(typelibOutputPath), { recursive: true });
		writeFileSync(typelibOutputPath, typelibText, { encoding: "utf8", flag: "w" });

		// Write index
		const indexOutputPath = this.config.metadataIndexPath;
		mkdirSync(dirname(indexOutputPath), { recursive: true });
		writeFileSync(indexOutputPath, this.getIndex(), { encoding: "utf8", flag: "w" });
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
	 * Update existing dummy typelib SourceFile.
	 * @param sourceFile
	 * @param metadata
	 */
	updateTypeLibSourceFile(sourceFile: ts.SourceFile, metadata: MetadataSource): ts.SourceFile
	{
		const context: MetadataContext = {
			metadataIdentifier: ts.factory.createIdentifier("Metadata"),
			moduleClassIdentifier: ts.factory.createIdentifier("Module"),
			typeClassIdentifier: ts.factory.createIdentifier("Type"),
		};

		return ts.factory.updateSourceFile(
			sourceFile,
			this.createMetadataStatements(metadata, context)
		);
	}

	/**
	 * Create SourceFile node with metadata library.
	 * @param metadata
	 * @param context
	 */
	private createSourceFile(metadata: MetadataSource, context: MetadataContext)
	{
		return ts.factory.createSourceFile(
			this.createMetadataStatements(metadata, context),
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);
	}

	private createMetadataStatements(metadata: MetadataSource, context: MetadataContext): ts.Statement[]
	{
		const plugins = this.config.plugins;

		// Find a first plugin implementing 'createModuleRegistrars'
		const firstCreateModuleRegistrars = plugins.find(p => p.createModuleRegistrars !== undefined);
		const metadataStatements = firstCreateModuleRegistrars?.createModuleRegistrars?.(metadata, context) || [];

		// Imports from plugins
		const pluginsImports = plugins.flatMap(plugin => plugin.getImports?.() || []);

		return [
			ts.factory.createImportDeclaration( // TODO: Generate import or require(), based on tsconfig
				undefined,
				ts.factory.createImportClause(
					false,
					undefined,
					ts.factory.createNamedImports([
						ts.factory.createImportSpecifier(
							false,
							undefined,
							context.metadataIdentifier
						),
						ts.factory.createImportSpecifier(
							false,
							undefined,
							context.moduleClassIdentifier
						),
						ts.factory.createImportSpecifier(
							false,
							undefined,
							context.typeClassIdentifier
						),
					])
				),
				ts.factory.createStringLiteral("rttist")
			),
			...pluginsImports,
			...this.createDependantTypeLibsImports(),
			ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(
						context.typeClassIdentifier,
						ts.factory.createIdentifier("configure")
					),
					undefined,
					[
						toExpression({
							nullability: !this.config.strictNullChecks
						})
					]
				)
			),
			...metadataStatements,
			// Empty default export because of nodenext/esm combination.
			ts.factory.createExportDefault(ts.factory.createObjectLiteralExpression())
		];
	}

	private transpile(sourceFile: ts.SourceFile, fileName: string): string
	{
		const source = this.printToTypeScriptCode(sourceFile);

		return ts.transpileModule(source, {
			fileName: fileName,
			compilerOptions: {
				moduleResolution: this.config.moduleResolution,
				module: this.config.module,
				...this.config.compilerOptions,
				declaration: false,
				strict: false,
				sourceMap: false,
				importHelpers: false,
				skipLibCheck: true,
				skipDefaultLibCheck: true
			}
		}).outputText/* + this.config.plugins.map(p => p.getEndScripts?.() ?? "").join("\n")*/;
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
	 * Generate imports of typelib files from all the dependencies.
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