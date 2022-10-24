import { Config }            from "../config/Config";
import {
	writeFileSync,
	mkdirSync
}                            from "fs";
import { dirname }           from "path";
import * as ts               from "typescript";
import { MetadataSource }    from "../declarations/TypeProperties";
import { DependencyManager } from "../dependencies/DependencyManager";
import { MetadataContext }   from "../plugins";
import { toExpression }      from "../utils/toExpression";
import { MetadataLibrary }   from "./MetadataLibrary";

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

	emit(metadata: MetadataSource): Promise<void>
	{
		// Create MetadataContext for plugins
		const metadataContext: MetadataContext = {
			metadataIdentifier: ts.factory.createIdentifier("Metadata"),
			moduleClassIdentifier: ts.factory.createIdentifier("Module"),
			typeClassIdentifier: ts.factory.createIdentifier("Type"),
		};

		const typelibOutputPath = this.config.metadataTypelibPath;

		return this.write(
			this.transpile(
				this.createSourceFile(metadata, metadataContext),
				typelibOutputPath
			),
			typelibOutputPath
		);
	}

	private write(typelibText: string, typelibOutputPath: string): Promise<void>
	{
		// Write typelib
		mkdirSync(dirname(typelibOutputPath), { recursive: true });
		writeFileSync(typelibOutputPath, typelibText, { encoding: "utf8", flag: "w" });

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
	 * @param metadata
	 * @param context
	 */
	private createSourceFile(metadata: MetadataSource, context: MetadataContext)
	{
		const plugins = this.config.plugins;

		// Find a first plugin implementing 'createModuleRegistrars'
		const firstCreateModuleRegistrars = plugins.find(p => p.createModuleRegistrars !== undefined);
		const metadataStatements = firstCreateModuleRegistrars?.createModuleRegistrars?.(metadata, context) || [];

		// Imports from plugins
		const pluginsImports = plugins.flatMap(plugin => plugin.getImports?.() || []);

		return ts.factory.createSourceFile(
			[
				ts.factory.createImportDeclaration(
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
				...metadataStatements
			],
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);
	}

	private transpile(sourceFile: ts.SourceFile, fileName: string): string
	{
		const source = this.printToTypeScriptCode(sourceFile);

		return ts.transpileModule(source, {
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
		}).outputText + this.config.plugins.map(p => p.getEndScripts?.() ?? "").join("\n");

		// if (this.config.encode)
		// {
		// 	const stub = readFileSync(
		// 		join(__dirname, "..", "..", "templates", "typelib.template.ts"),
		// 		{ encoding: "utf-8" }
		// 	);
		// 	transpiledTypelib = transpiledTypelib + stub;
		// }
		//
		// return transpiledTypelib;
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