import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";
import { Config } from "./config/config";
import { removeExtension } from "./transformer/utils/removeExtension";
import { normalizePath, resolvePath } from "./utils/path";
import { lazyTypescript } from "./utils/lazy-typescript";
import { ModuleIdentifierGenerator } from "./transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { Logger, LogLevel } from "./logging";
import { blue, cyan, whiteBright } from "chalk";
import { LogBuffer } from "./logging/log-buffer";

export type TypeLibBundleResult = {
	name: string;
	bytes: number;
};

export class TypelibGenerator {
	private readonly logger = new Logger("TypelibGenerator", undefined, LogBuffer.autoFlush);

	constructor(
		private readonly config: Config,
		private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator,
		private readonly files: string[]
	) {
		// this.startRegenerateInterval();
	}

	/**
	 * Manually invoke typelib generation and bundling.
	 */
	async generate() {
		const projectTypeLibImporterPromise = this.generateProjectTypelibImporter();
		await this.generateTypeLibs();
		const result = await this.bundle();
		await projectTypeLibImporterPromise;
	}

	getProjectFiles() {
		return this.files;
	}

	async fileAdded(file: string) {
		this.files.push(file);
		await this.generate();
	}

	async filesRemoved(files: string[]) {
		files.forEach((file) => {
			const index = this.files.indexOf(file);

			if (index >= 0) {
				this.files.splice(index, 1);
			}
		});

		await this.generate();
	}

	async fileChanged(file: string) {
		await this.generateTypeLibs();
		await this.bundle();
	}

	/**
	 * (Re)generate typelibs.
	 */
	private async generateTypeLibs() {
		await Promise.all([
			this.generateMetadataIndex(),
			this.generateTypelib("internal.typelib.ts", false),
			this.generateTypelib("public.typelib.ts", true),
		]);
	}

	private async generateMetadataIndex() {
		await fs.writeFile(
			resolvePath(this.config.cacheDir, "metadata.index.ts"),
			`${this.files
				.map(
					(file, index) =>
						`import * as $${index} from "./${removeExtension(
							normalizePath(
								path.relative(this.config.tsRootDir, path.resolve(this.config.projectRoot, file))
							)
						)}";`
				)
				.join("\n")}
export const metadataCollection: Array<{ add(library: any, stripInternals: boolean): void}> = [${this.files
				.map((_, index) => `$${index}`)
				.join(",")}];`,
			"utf-8"
		);
	}

	private async generateTypelib(typelibFileName: string, stripInternals: boolean) {
		await fs.writeFile(
			resolvePath(this.config.cacheDir, typelibFileName),
			`import { MetadataLibrary, GlobalMetadata } from "rttist";
import { metadataCollection } from "./metadata.index";
const Metadata = new MetadataLibrary({
	nullability: ${this.config.strictNullChecks ? "false" : "true"},
}, "@${this.config.packageInfo.name}${stripInternals ? "" : ":internal"}", GlobalMetadata);
metadataCollection.forEach((mod) => mod.add(Metadata, ${stripInternals ? "true" : "false"}));
export { Metadata };`,
			"utf-8"
		);
	}

	private async generateProjectTypelibImporter() {
		await fs.writeFile(
			resolvePath(this.config.tsRootDir, "metadata.typelib.ts"),
			`/*
* This file is generated automatically by the RTTIST TypeGen tool.
* Do not edit it manually.
*/
import { ModuleImporter, MetadataLibrary, createGetTypeFunction, createCallsite, resolveFromFunctionCallsite, resolveFromMethodCallsite, getClassTypeParameter, } from "rttist";
${this.config.dependenciesInfo
	.filter((dep) => dep.metadataPath !== undefined)
	.map((dep) => `import "${dep.metadataImportSpecifier}";`)
	.join("\n")}
// @ts-ignore; configure this as an external dependency
import { Metadata as InternalMetadataLibrary } from "./internal.typelib";

ModuleImporter.registerImporters({
	${this.files
		.map((file, index) => {
			const absolutePath = path.resolve(this.config.projectRoot, file);
			const moduleId = this.moduleIdentifierGenerator.generateModuleIdentifier(absolutePath);
			const relativePathFromTsRootDir = removeExtension(
				normalizePath(path.relative(this.config.tsRootDir, absolutePath))
			);

			return `"${moduleId}": () => import("./${relativePathFromTsRootDir}.js"),`;
		})
		.join("\n\t")}
});

export const getType = createGetTypeFunction(InternalMetadataLibrary);
export const resolveType = InternalMetadataLibrary.resolveType.bind(InternalMetadataLibrary);
export const _ = {
	cs$: createCallsite,
	resFnCs$: resolveFromFunctionCallsite,
	resMCs$: resolveFromMethodCallsite,
	getTP$: getClassTypeParameter,
};
/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;`,
			"utf-8"
		);
	}

	/**
	 * Create typelibs JS bundles.
	 */
	private async bundle(): Promise<TypeLibBundleResult[]> {
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
		var bundleResult = Object.keys(outputs).map(
			(key) =>
				({
					name: key,
					bytes: outputs[key].bytes,
				}) satisfies TypeLibBundleResult
		);
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

	private printTypelibsInfo(typelibResult: TypeLibBundleResult[]) {
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
					"\n\t" + cyan(typelib.name.padEnd(longestName, " ")) + " | " + blue(typelib.bytes / 1000 + " kB"),
				])
			);
		}
	}
}
