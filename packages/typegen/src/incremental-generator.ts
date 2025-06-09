import { CacheStats } from "./lib/cache/cache-stats";
import { type Config, getParsedConfig } from "./lib/config/config";
import type { Logger } from "./lib/logging";
import type { CachedStorage } from "./lib/cache/cached-storage";
import { MetadataGenerator, type MetadataGeneratorResult } from "./lib/metadata-generator";
import { ModuleIdentifierGenerator } from "./lib/transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { TypelibGenerator } from "./lib/typelib-generator";
import { normalizePath, resolvePath } from "./lib/utils/path";
import { resolveMetadataCachePath, resolveSourceFileCachePath } from "./lib/utils/resolve-sourcefile-cache-path";
import { projectFilesProvider } from "./project-files-provider";
import { TypescriptProgramProvider } from "./typescript-program-provider";
import { TypescriptCompilerHostFactory } from "./lib/typescript-compilerhost-factory";
import PromiseSource from "promise-cs";

export type IncrementalGeneratorOptions = {
	/**
	 * Path to the project root directory
	 */
	projectRoot: string;
};

/**
 * Top level object for incremental metadata generation.
 */
export class IncrementalGenerator {
	private readonly _cacheStats: CacheStats;
	private readonly _metadataGenerator: MetadataGenerator;
	private readonly _typelibGenerator: TypelibGenerator;

	private runningGeneratePromiseCompletionSource?: PromiseSource<Record<string, MetadataGeneratorResult>> = undefined;

	get config(): Config {
		return this._config;
	}

	/**
	 * @param _config
	 * @param _logger
	 * @param _sourceFilesCachedStorage CachedStorage for source TS files.
	 * @param _metadataCachedStorage CachedStorage for metadata generated TS metadata files.
	 * @param _programProvider
	 */
	constructor(
		private readonly _config: Config,
		private readonly _logger: Logger,
		private readonly _sourceFilesCachedStorage: CachedStorage,
		private readonly _metadataCachedStorage: CachedStorage,
		private readonly _programProvider: TypescriptProgramProvider
	) {
		this._cacheStats = new CacheStats(_config, this._logger);
		this._metadataGenerator = new MetadataGenerator(
			this._config,
			this._programProvider,
			this._sourceFilesCachedStorage,
			this._metadataCachedStorage
		);
		this._typelibGenerator = new TypelibGenerator(_config, new ModuleIdentifierGenerator(_config));
	}

	/**
	 * Returns list of all source files included in the project.
	 */
	async getProjectFiles(): Promise<string[]> {
		const entries = await projectFilesProvider.getSourceFilesWithStats(this._config);
		return entries.map((entry) => entry.path);
	}

	/**
	 *
	 * @param logger
	 * @param sourceFilesCachedStorage CachedStorage for source TS files.
	 * @param metadataCachedStorage CachedStorage for metadata generated TS metadata files.
	 * @param options
	 */
	static async create(
		logger: Logger,
		sourceFilesCachedStorage: CachedStorage,
		metadataCachedStorage: CachedStorage,
		options: IncrementalGeneratorOptions
	): Promise<IncrementalGenerator> {
		const config = await getParsedConfig({
			...options,
			typecheck: true,
			watch: false,
			force: false,
		});

		const compilerHostFactory = new TypescriptCompilerHostFactory(config);
		const typescriptProgramProvider = new TypescriptProgramProvider(config, compilerHostFactory);

		return new IncrementalGenerator(
			config,
			logger,
			sourceFilesCachedStorage,
			metadataCachedStorage,
			typescriptProgramProvider
		);
	}

	/**
	 * Generate metadata for given files.
	 * @param filesToRegenerate Normalized paths of source TypeScript files you want to generate metadata for.
	 * You should pass only files that changed since last generation,
	 * but of course you can pass all files if you want.
	 * If you pass only files that changed, but you want to get metadata of all the files,
	 * you can get the metadata from CachedStorage (metadataCachedStorage) you provided.
	 * @param force By default, even if you specify all files in filesToRegenerate parameter,
	 * cached metadata will be used in case that no cache was detected for given file.
	 * If you want to force generation of all files, set this parameter to true.
	 * @param regenerateAllFiles If set to true, all files will be regenerated and the filesToRegenerate parameter will be ignored.
	 * @returns Dictionary indexed by input fileNames
	 */
	async generate(
		filesToRegenerate: string[],
		force: boolean,
		regenerateAllFiles = false
	): Promise<Record<string, MetadataGeneratorResult>> {
		if (filesToRegenerate.length === 0 && !regenerateAllFiles) {
			return {};
		}

		if (this.runningGeneratePromiseCompletionSource !== undefined) {
			return this.runningGeneratePromiseCompletionSource?.promise;
		}

		try {
			const promiseSource = new PromiseSource<Record<string, MetadataGeneratorResult>>();
			this.runningGeneratePromiseCompletionSource = promiseSource;

			// Normalize paths to be relative to project root
			const projectRootWithTrailingSlash = `${normalizePath(this._config.projectRoot)}/`;
			filesToRegenerate = filesToRegenerate.map((file) =>
				normalizePath(file).replace(projectRootWithTrailingSlash, "")
			);

			let changedFilesToRegenerate = filesToRegenerate;
			const result: Record<string, MetadataGeneratorResult> = {};

			// TODO: Optimize! We don't want to access FS every time. We should track the files.
			const allFiles = await projectFilesProvider.getSourceFilesWithStats(this._config);

			// When not forced, try to reuse cached metadata.
			if (!force) {
				const filesWithUpdatedStats = projectFilesProvider.getFilesToRegenerate(
					allFiles,
					this._config,
					this._cacheStats
				);

				// OVERRIDE filesToRegenerate
				if (regenerateAllFiles) {
					filesToRegenerate = allFiles.map((file) => file.path);
				}

				const unchangedFiles = filesToRegenerate.filter((file) => !filesWithUpdatedStats.includes(file));
				// Update files requested to regenerate to files that were changed and that we want to regenerate.
				changedFilesToRegenerate = filesWithUpdatedStats.filter((file) => filesToRegenerate.includes(file));

				// Try to load cached metadata; we just guess that it is in cache, but we don't know that for sure
				// (there may be Stat file but cache was manually deleted by user).
				// We try to get all files from cache and files that are not available in cache
				// will be regenerated.
				for (const cachedFile of unchangedFiles) {
					const metadataSourceFilePath = resolveSourceFileCachePath(cachedFile, this._config);
					const metadataPath = resolveMetadataCachePath(cachedFile, this._config);

					try {
						const cachedSourceFile = await this._metadataCachedStorage.read(metadataSourceFilePath);
						const cachedMetadata = await this._metadataCachedStorage.read(metadataPath);

						if (cachedSourceFile && cachedMetadata) {
							result[cachedFile] = {
								fileName: cachedFile,
								metadataSourceFile: cachedSourceFile,
								metadata: JSON.parse(cachedMetadata),
							};
						} else {
							changedFilesToRegenerate.push(cachedFile);
						}
					} catch (e) {
						changedFilesToRegenerate.push(cachedFile);
					}
				}
			}

			if (changedFilesToRegenerate.length === 0) {
				return {};
			}

			changedFilesToRegenerate = changedFilesToRegenerate.map((path) => normalizePath(path));

			const regeneratedResult = await this._metadataGenerator.generate(changedFilesToRegenerate);

			// TODO: We don't have to regenerate typelibs if there is no new or deleted file.; just bundle would require it.
			await this._typelibGenerator.generate(allFiles.map((entry) => entry.path));

			for (const [file, metadataResult] of Object.entries(regeneratedResult)) {
				result[file] = metadataResult;
			}

			this._cacheStats.value.lastGeneration = new Date();
			this._cacheStats.persist();

			// Resolve PromiseSource after we return our result from this generate() call.
			// Otherwise, later calls to generate() will return values before this one.
			setTimeout(() => {
				promiseSource.resolve(result);
			});

			return result;
		} finally {
			this.runningGeneratePromiseCompletionSource = undefined;
		}
	}
}
