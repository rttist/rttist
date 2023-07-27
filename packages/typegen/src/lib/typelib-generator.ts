import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import { ModuleKind } from "typescript";
import { Config } from "./config/config";
import { removeExtension } from "./transformer/utils/removeExtension";
import { resolvePath } from "./utils/path";

export class TypelibGenerator {
	constructor(
		private readonly config: Config,
		private readonly files: string[]
	) {
		// this.startRegenerateInterval();
	}

	/**
	 * Manually invoke typelib generation and bundling.
	 */
	generate() {}

	filesAdded(files: string[]) {
		this.files.push(...files);

		// TODO: Generate Typelibs and bundles
	}

	filesRemoved(files: string[]) {
		files.forEach((file) => {
			const index = this.files.indexOf(file);

			if (index >= 0) {
				this.files.splice(index, 1);
			}

			// TODO: Delete metadata from the cache folder
		});

		// TODO: Generate Typelibs and bundles
	}

	fileChanged(file: string) {
		// TODO: Generate only bundle; typelibs didn't change
	}

	/**
	 * (Re)generate typelibs.
	 */
	private async generateTypelibs() {
		await this.generateMetadataIndex();
		await this.generateTypelib("metadata.typelib.ts", false);
		await this.generateTypelib("public.typelib.ts", true);
	}

	private async generateMetadataIndex() {
		await fs.writeFile(
			resolvePath(this.config.cacheDir, "metadata.index.ts"),
			`${this.files.map((file, index) => `import * as $${index} from "./${removeExtension(file)}";`).join("\n")}
export const metadataCollection: Array<{ add(library: MetadataLibrary, stripInternals: boolean): void}> = [${this.files
				.map((_, index) => `$${index}`)
				.join(",")}];`,
			"utf-8"
		);
	}

	private async generateTypelib(typelibFileName: string, stripInternals: boolean) {
		await fs.writeFile(
			resolvePath(this.config.cacheDir, typelibFileName),
			`import { MetadataLibrary } from "rttist";
import { metadataCollection } from "./metadata.index";
const Metadata = new MetadataLibrary();
metadataCollection.forEach((mod) => mod.add(Metadata, ${stripInternals ? "true" : "false"}));
export { Metadata };`,
			"utf-8"
		);
	}

	/**
	 * Create typelibs JS bundles.
	 */
	private async bundle() {
		await esbuild.build({
			entryPoints: [
				resolvePath(this.config.cacheDir, "metadata.typelib.ts"),
				resolvePath(this.config.cacheDir, "public.typelib.ts"),
			],

			bundle: true,
			minify: true,
			outfile: resolvePath(this.config.outDir, "metadata.typelib.js"),
			platform: "neutral",
			format: this.config.module === ModuleKind.CommonJS ? "cjs" : "esm",
			target: "es2015",
		});
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
	getProjectFiles() {
		return this.files;
	}
}
