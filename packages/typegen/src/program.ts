import { startTime } from "./lib/utils/performance-import-time-start";
import type { Entry } from "fast-glob";
import FastGlob from "fast-glob";
import type { CLI } from "./cli";
import type { Worker } from "worker_threads";
import { WorkerMessage } from "./declarations/worker-message";
import { Config, getParsedConfig } from "./lib/config/config";
import { CacheStats } from "./lib/cache/cache-stats";
import { WorkerArguments } from "./declarations/worker-arguments";
import { Logger, LogLevel } from "./lib/logging";
import { LogBuffer } from "./lib/logging/log-buffer";
import { TypeLibBundleResult, TypelibGenerator } from "./lib/typelib-generator";
import { resolvePath } from "./lib/utils/path";
import * as cliProgress from "cli-progress";
import { WorkerMessageType } from "./declarations/worker-message-type";
import { ModuleIdentifierGenerator } from "./lib/transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { blue, cyan, dim, whiteBright } from "chalk";

let startCacheServer: undefined | typeof import("memory-mapped-files").startCacheServer;
try {
	// import { startCacheServer as scs } from "memory-mapped-files";
	startCacheServer = require("memory-mapped-files").startCacheServer;
} catch (e) {}

// TODO: Refactor this file. Separate base build, spawning and watching.

export class Program {
	private readonly logger = new Logger("Program", undefined, LogBuffer.autoFlush);
	private readonly performanceEntries: {
		parseStart: number;
		start: number;
		initialization?: number;
		metadataGenerationFinished?: number;
		completed?: number;
	} = {
		parseStart: startTime,
		start: performance.now(),
	};

	constructor(private readonly cli: CLI) {}

	private async getConfig(): Promise<Config> {
		return await getParsedConfig(this.cli.getCommandLineArguments());
	}

	public async run(): Promise<void> {
		const config = await this.getConfig();

		Logger.setLevel(config.logLevel);
		this.printInitialMessage(config);
		const stats = new CacheStats(config, this.logger);
		const allFiles = await this.getSourceFilesWithStats(config);
		const changedFilesToRegenerate = this.getFilesToRegenerate(allFiles, config, stats);

		if (changedFilesToRegenerate.length === 0) {
			this.handleNoChangesDetected(config);
			return;
		}

		const allFilesPath = allFiles.map((x) => x.path);
		const typelibGenerator = new TypelibGenerator(config, new ModuleIdentifierGenerator(config), allFilesPath);

		// run MMF cache server
		startCacheServer?.(config.tsRootDir, ["**/*.ts", "**/*.tsx", "**/*.d.ts"]);

		// SPAWN workers
		const workers = await this.spawnWorkers(changedFilesToRegenerate, config);

		const progressBar = this.createProgressBar(changedFilesToRegenerate);
		this.performanceEntries.initialization = performance.now();
		await this.waitWorkersFinishedPromise(workers, progressBar);
		this.performanceEntries.metadataGenerationFinished = performance.now();

		this.flushWorkersLogBuffer(workers);
		await this.waitWorkersExitPromise(workers);

		// await generateTypelibFiles(
		// 	allFiles.map((x) => x.path),
		// 	config
		// );
		const typelibResult = await typelibGenerator.generate();
		this.printTypelibsInfo(typelibResult);
		this.performanceEntries.completed = performance.now();
		this.printPerformanceInfo(config);

		stats.value.lastGeneration = new Date();
		stats.persist();

		// const completedPS = new PromiseSource();
		// Watch files in case the watch mode is enabled.
		if (config.watch) {
			this.logger.warn("Watch mode is currently deactivated because of WIP refactoring.");
			// const watcher = new Watcher(config, typelibGenerator, completedPS);
			// watcher.watch(allFilesPath);
		}
		// completedPS.resolve();
	}

	/**
	 * Flush workers log buffers
	 */
	private flushWorkersLogBuffer(workers: any[]) {
		workers.forEach((worker) => {
			worker.worker.postMessage({ type: WorkerMessageType.FlushLogBuffer });
		});
	}

	/**
	 * Create Promise waiting for all workers to exit.
	 */
	private waitWorkersExitPromise(workers: any[]) {
		return Promise.all(workers.map((entry) => entry.workerExitedPromise));
	}

	/**
	 * Create Promise waiting for all workers to finish generation; with progress update.
	 */
	private async waitWorkersFinishedPromise(workers: any[], progressBar: cliProgress.SingleBar) {
		await Promise.all(
			workers.map((entry) => {
				entry.worker.on("message", (message: WorkerMessage) => {
					if (message.type === WorkerMessageType.FileFinished) {
						progressBar.increment();
					}
				});

				return entry.generationCompletedPromise;
			})
		);

		progressBar.stop();
	}

	private handleNoChangesDetected(config: Config) {
		this.printNoChangesDetected();
		this.performanceEntries.initialization = performance.now();
		this.printPerformanceInfo(config);
	}

	private createProgressBar(files: string[]) {
		const progressBar = new cliProgress.SingleBar(
			{
				stream: process.stdout,
				clearOnComplete: false,
				format: "processing files [{bar}] {percentage}% | {value}/{total}",
			},
			cliProgress.Presets.legacy
		);
		progressBar.start(files.length, 0);
		return progressBar;
	}

	private getFilesToRegenerate(allFiles: Entry[], config: Config, stats: CacheStats) {
		// Filter out files that have not been modified since last generation
		const files = config.force
			? allFiles
			: allFiles.filter((entry) => !entry.stats || entry.stats.mtime > stats.value.lastGeneration);

		return files.map((entry) => entry.path);
	}

	private async spawnWorkers(fileNames: string[], config: Config) {
		const cpus = (await import("os")).cpus;
		const Worker = (await import("worker_threads")).Worker;

		const cpuCount = Math.round(cpus().length / 3);
		// Find out how many files each worker should process; If it's less than 5 per worker, use only one worker.
		const workerFileCount =
			fileNames.length < cpuCount * 5 ? fileNames.length : Math.floor(fileNames.length / cpuCount) || 1;

		const workers = [];

		// Visit every sourceFile in the program
		for (let filesOffset = 0, cpu = 1; filesOffset < fileNames.length; cpu++) {
			// Get given number of files for this worker; or take the rest if this is the last worker.
			const files = fileNames.slice(filesOffset, cpu === cpuCount ? undefined : filesOffset + workerFileCount);

			if (!files.length) {
				break;
			}

			filesOffset += files.length;

			const worker = this.spawn(config, files, this.logger, Worker);

			worker.workerExitedPromise.catch((error) => {
				this.logger.error("Worker failed.", error);
			});

			workers.push(worker);
		}

		this.logger.debug("Workers spawned:", workers.length);

		return workers;
	}

	private printInitialMessage(config: Config) {
		this.logger.log(
			LogLevel.Info,
			undefined,
			"Configuration",
			`\n\t${whiteBright("project root:".padEnd(18, " ") /*, LogColor.bright*/)} ${blue(config.projectRoot)}`,
			// "\n\ttypescript root directory: " + config.tsRootDir, // tsRootDir required typescript; but we don't want to import it early
			`\n\t${whiteBright("cache directory:".padEnd(18, " "))} ${blue(config.cacheDir)}`
		);
		this.logger.buffer.log("");
	}

	private printNoChangesDetected() {
		this.logger.log(
			LogLevel.Always,
			undefined,
			`${cyan("No changes detected.")}\n\t${dim("Use '-f' or '--force' to force generation.")}`
		);
	}

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

	private printPerformanceInfo(config: Config) {
		this.logger.buffer.log("");
		this.logger.log(
			config.devMode ? LogLevel.Dev : LogLevel.Debug,
			undefined,
			cyan("Completed \u2713"),

			`\n\t${dim("Importing modules: ")} ${blue(
				roundPerfTime(this.performanceEntries.start - this.performanceEntries.parseStart).toString()
			)} ${dim("sec.")}`,

			`\n\t${dim("Initialization: ")} ${blue(
				roundPerfTime(
					(this.performanceEntries.initialization ?? performance.now()) - this.performanceEntries.start
				).toString()
			)} ${dim("sec.")}`,

			...(this.performanceEntries.metadataGenerationFinished === undefined ||
			this.performanceEntries.initialization === undefined
				? []
				: [
						`\n\t${dim("Generating metadata: ")} ${blue(
							roundPerfTime(
								this.performanceEntries.metadataGenerationFinished -
									this.performanceEntries.initialization
							).toString()
						)} ${dim("sec.")}`,
				  ]),

			...(this.performanceEntries.completed === undefined ||
			this.performanceEntries.metadataGenerationFinished === undefined
				? []
				: [
						`\n\t${dim("Bundling typelib: ")} ${blue(
							roundPerfTime(
								this.performanceEntries.completed - this.performanceEntries.metadataGenerationFinished
							).toString()
						)} ${dim("sec.")}`,
				  ]),

			...(this.performanceEntries.completed === undefined || this.performanceEntries.initialization === undefined
				? []
				: [
						`\n\tTotal time: ${blue(
							roundPerfTime(
								this.performanceEntries.completed - this.performanceEntries.parseStart
							).toString()
						)} sec.`,
				  ])

			// "\n\tProcessed",
			// this.metadata.getNumberOfTypes(),
			// "type(s) from",
			// this.metadata.getNumberOfModules(),
			// "module(s)."
		);

		function roundPerfTime(time: number): number | string {
			if (time < 0) {
				return "N/A";
			}

			return Math.round(time * 100) / 100000;
		}
	}

	/**
	 * Match source files by configured glob patterns.
	 * @param config
	 * @private
	 */
	private async getSourceFilesWithStats(config: Config) {
		return await FastGlob.glob(config.include, {
			...this.getSourceFilesGlobOptions(config),
			stats: true,
		});
	}

	private getSourceFilesGlobOptions(config: Config) {
		return {
			cwd: config.projectRoot,
			dot: false,
			onlyFiles: true,
			ignore: config.exclude,
			absolute: false,
			followSymbolicLinks: true,
		};
	}

	private spawn(config: Config, files: string[], logger: Logger, Worker: typeof import("worker_threads").Worker) {
		if (config.devMode) {
			logger.trace("Spawning worker for files", files);
		}

		const worker = new Worker(resolvePath(__dirname, "worker.js"), {
			// const worker = new Worker(resolvePath(dirname(fileURLToPath(import.meta.url)), "worker.js"), {
			workerData: {
				files: files,
				config: config,
			} satisfies WorkerArguments,
		});

		return {
			worker: worker,
			workerExitedPromise: new Promise((resolve, reject) => {
				this.finalizeOnWorkerExit(worker, resolve, reject);
			}),
			generationCompletedPromise: new Promise((resolve, reject) => {
				try {
					this.finalizeOnWorkerExit(worker, resolve, reject);

					worker.on("message", (message: WorkerMessage) => {
						if (message.type === WorkerMessageType.GenerationCompleted) {
							resolve(undefined);
						}
					});
				} catch (error) {
					reject(error);
				}
			}),
		};
	}

	private finalizeOnWorkerExit(
		worker: Worker,
		resolve: (value: PromiseLike<unknown> | unknown) => void,
		reject: (reason?: any) => void
	) {
		worker.on("error", reject);
		worker.on("exit", (code) => {
			if (code !== 0) {
				reject(new Error(`Worker stopped with exit code ${code}`));
			}

			resolve(undefined);
		});
	}
}
