import * as esbuild from "esbuild";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Config } from "./config/config";
import { removeExtension } from "./transformer/utils/remove-extension";
import { correctPath, normalizePath, resolvePath } from "./utils/path";
import { lazyTypescript } from "./utils/lazy-typescript";
import type { ModuleIdentifierGenerator } from "./transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { Logger, LogLevel, LogBuffer } from "./logging";
import { blue, cyan, whiteBright } from "chalk";

export type TypelibBundleResult = {
	name: string;
	bytes: number;
};

export class TypelibGenerator {
	private readonly logger = new Logger("TypelibGenerator", undefined, LogBuffer.autoFlush);

	/**
	 * @param config
	 * @param moduleIdentifierGenerator
	 */
	constructor(config: Config, moduleIdentifierGenerator: ModuleIdentifierGenerator);
	/**
	 * @deprecated
	 * @param config
	 * @param moduleIdentifierGenerator
	 * @param files
	 */
	constructor(config: Config, moduleIdentifierGenerator: ModuleIdentifierGenerator, files: string[]);
	constructor(
		private readonly config: Config,
		private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator,
		private readonly files: string[] = []
	) {
		// this.startRegenerateInterval();
	}

	/**
	 * Manually invoke typelib generation and bundling.
	 */
	public async generate(files: string[] = this.files) {
		const projectTypeLibImporterPromise = this.generateProjectTypelibImporter(files);
		await this.generateTypelibs(files);
		await projectTypeLibImporterPromise;
	}

	/**
	 * @deprecated
	 */
	getProjectFiles() {
		return this.files;
	}

	/**
	 * @deprecated
	 * @param file
	 */
	async fileAdded(file: string) {
		this.files.push(file);
		await this.generate();
		await this.bundle();
	}

	/**
	 * @deprecated
	 * @param files
	 */
	async filesRemoved(files: string[]) {
		for (const file of files) {
			const index = this.files.indexOf(file);

			if (index >= 0) {
				this.files.splice(index, 1);
			}
		}

		await this.generate();
		await this.bundle();
	}

	/**
	 * @deprecated
	 * @param file
	 */
	async fileChanged(file: string) {
		await this.generateTypelibs(this.files);
		await this.bundle();
	}

	/**
	 * (Re)generate typelibs.
	 */
	private async generateTypelibs(files: string[]) {
		await Promise.all([
			this.persistMetadataIndex(this.generateMetadataIndex(files)),
			this.generateTypelib("internal.typelib.ts", false),
			this.generateTypelib("public.typelib.ts", true),
		]);
	}

	/**
	 * Generate metadata.index.ts file that picks up all the individual metadata files and creates single collection
	 */
	private generateMetadataIndex(files: string[]): string {
		return `${files
			.map(
				(file, index) =>
					`import * as $${index} from "./${removeExtension(
						normalizePath(path.relative(this.config.tsRootDir, path.resolve(this.config.projectRoot, file)))
					)}";`
			)
			.join("\n")}
export const metadataCollection: Array<{ add(library: any, stripInternals: boolean): void}> = [${files
			.map((_, index) => `$${index}`)
			.join(",")}];`;
	}

	private async persistMetadataIndex(metadataIndexSourceFile: string) {
		await fs.writeFile(resolvePath(this.config.cacheDir, "metadata.index.ts"), metadataIndexSourceFile, "utf-8");
	}

	private async generateTypelib(typelibFileName: string, stripInternals: boolean) {
		await fs.writeFile(
			resolvePath(this.config.cacheDir, typelibFileName),
			`import { BaseMetadataLibrary, GlobalMetadata } from "rttist";
import { metadataCollection } from "./metadata.index";
const Metadata = new BaseMetadataLibrary({
	nullability: ${this.config.strictNullChecks ? "false" : "true"},
}, "@${this.config.packageInfo.name}${stripInternals ? "" : ":internal"}", GlobalMetadata);
metadataCollection.forEach((mod) => mod.add(Metadata, ${stripInternals ? "true" : "false"}));
export { Metadata };`,
			"utf-8"
		);
	}

	private async generateProjectTypelibImporter(files: string[]) {
		const filesToImport = files
			.filter((file) => !file.endsWith(".d.ts"))
			.map((file, index) => {
				const absolutePath = path.resolve(this.config.projectRoot, file);
				const moduleId = this.moduleIdentifierGenerator.generateModuleIdentifier(absolutePath);
				const relativePathFromTsRootDir = correctPath(
					path.relative(this.config.cacheDir, absolutePath),
					"ts",
					this.config
				);

				return `"${moduleId}": () => import("./${relativePathFromTsRootDir}"),`;
			})
			.join("\n\t");

		const importOfDependencies = this.config.dependenciesInfo
			.filter((dep) => dep.metadataPath !== undefined)
			.map((dep) => `import "${dep.metadataImportSpecifier}";`)
			.join("\n");

		await fs.writeFile(
			resolvePath(this.config.cacheDir, "metadata.typelib.ts"),
			`/*
* This file is generated automatically by the RTTIST TypeGen tool.
* Do not edit it manually.
*/
import { type Type, type MetadataLibrary, type MetadataContextHelpers, ModuleImporter, createCallsite, resolveFromFunctionCallsite, getClassTypeParameter } from "rttist";

// Typelibs of depdendencies
${importOfDependencies}

// @ts-ignore; !! CONFIGURE THIS AS AN EXTERNAL DEPENDENCY !!
import { Metadata as InternalMetadataLibrary } from "${this.config.typelibImportPath}";

ModuleImporter.registerImporters({
	${filesToImport}
});

export const getType: MetadataLibrary["getType"] = InternalMetadataLibrary.getType;
export const resolveType: MetadataLibrary["resolveType"] = InternalMetadataLibrary.resolveType;
export const _: MetadataContextHelpers = {
	cs$: createCallsite,
	resFnCs$: (fn, mappers) => resolveFromFunctionCallsite(fn, mappers, InternalMetadataLibrary),
	getTP$: getClassTypeParameter,
	getGC$: InternalMetadataLibrary.getGenericClass,
	cg$: InternalMetadataLibrary.constructGeneric
};
/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;`,
			"utf-8"
		);
	}

	/**
	 * Create Typelib JS bundles (public & internal)
	 */
	public async bundle(): Promise<TypelibBundleResult[]> {
		const result: esbuild.BuildResult = await esbuild.build({
			entryPoints: [
				resolvePath(this.config.cacheDir, "internal.typelib.ts"),
				resolvePath(this.config.cacheDir, "public.typelib.ts"),
			],

			bundle: true,
			minify: true,
			outdir: this.config.outDir,
			// outdir: resolvePath(this.config.tsRootDir, ".metadata"),
			platform: "neutral",
			format: this.config.module === lazyTypescript.get().ModuleKind.CommonJS ? "cjs" : "esm",
			target: "es2015",
			external: ["rttist"],
			metafile: true,
		});

		const outputs = result.metafile?.outputs ?? {};
		const bundleResult: TypelibBundleResult[] = [];

		for (const key of Object.keys(outputs)) {
			bundleResult.push({
				name: key,
				bytes: outputs[key].bytes,
			} satisfies TypelibBundleResult);
		}

		this.printTypelibsInfo(bundleResult);

		return bundleResult;
	}

	// private clearOnKill() {
	// 	const clear = () => {
	// 		if (this.regenerateInterval) {
	// 			clearInterval(this.regenerateInterval);
	// 		}
	// 	};
	//
	// 	process.on("SIGINT", clear);
	// 	process.on("SIGTERM", clear);
	// }
	//
	// /**
	//  * Start interval which regenerates typelib files after changes.
	//  */
	// private startRegenerateInterval() {
	// 	this.regenerateInterval = setInterval(this.regenerateIntervalHandler, 100);
	// }
	//
	// private async regenerateIntervalHandler() {
	// 	try {
	// 		if (!this.regenerateTypelibs) {
	// 			// Skip if the regenerate is not requested.
	// 			return;
	// 		}
	//
	// 		// Reset the regenerate flag.
	// 		this.regenerateTypelibs = false;
	//
	// 		// Clear interval to prevent multiple regenerations.
	// 		clearInterval(this.regenerateInterval);
	//
	// 		// TODO: Regenerate
	// 		this.generate();
	// 		// await generateTypelibFiles(Array.from(this.allFiles), this.config);
	//
	// 		this.startRegenerateInterval();
	// 	} catch (err) {
	// 		this.logger.error(err);
	// 	}
	// }

	private printTypelibsInfo(typelibResult: TypelibBundleResult[]) {
		if (typelibResult.length !== 0) {
			const longestName = Math.max(...typelibResult.map((x) => x.name.length));

			this.logger.buffer.log("");
			this.logger.log(
				LogLevel.Info,
				undefined,
				`\n\t${whiteBright.bold(
					"Typelib files".padEnd(longestName, " ") /*, LogColor.bright*/
				)} | ${whiteBright.bold("Size")}`,
				...typelibResult.flatMap((typelib) => [
					`\n\t${cyan(typelib.name.padEnd(longestName, " "))} | ${blue(`${typelib.bytes / 1000} kB`)}`,
				])
			);
		}
	}
}
