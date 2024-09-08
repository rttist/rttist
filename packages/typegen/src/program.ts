// Keep PerformanceTracker first because of start time.
import { PerformanceTracker } from "./utils/PerformanceTracker";
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
import { TypelibGenerator } from "./lib/typelib-generator";
import { resolvePath } from "./lib/utils/path";
import * as cliProgress from "cli-progress";
import { WorkerMessageType } from "./declarations/worker-message-type";
import { ModuleIdentifierGenerator } from "./lib/transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { blue, dim, green } from "chalk";
import { printInitialMessage, printNoChangesDetected } from "./utils/console-messages";

let startCacheServer: undefined | typeof import("memory-mapped-files").startCacheServer;
try {
	// startCacheServer = require("memory-mapped-files").startCacheServer;
	// import { startCacheServer as scs } from "memory-mapped-files";
} catch (e) {}

// TODO: Refactor this file. Separate base build, spawning and watching.

export class Program {
	private readonly logger = new Logger("Program", undefined, LogBuffer.autoFlush);
	private readonly performanceTracker = new PerformanceTracker();

	constructor(private readonly cli: CLI) {}

	private async getConfig(): Promise<Config> {
		return await getParsedConfig(this.cli.getCommandLineArguments());
	}

	public async run(): Promise<void> {
		const config = await this.getConfig();

		Logger.setLevel(config.logLevel);
		printInitialMessage(this.logger, config);
		const stats = new CacheStats(config, this.logger);
		const allFiles = await this.getSourceFilesWithStats(config);
		const allFilesPath = allFiles.map((x) => x.path);
		const changedFilesToRegenerate = this.getFilesToRegenerate(allFiles, config, stats);
		const typelibGenerator = new TypelibGenerator(config, new ModuleIdentifierGenerator(config), allFilesPath);

		// run MMF cache server
		if (changedFilesToRegenerate.length > 0 || config.watch) {
			startCacheServer?.(config.tsRootDir, ["**/*.ts", "**/*.tsx", "**/*.d.ts"]);
		}

		// Generate metadata and typelibs
		await this.generate(changedFilesToRegenerate, config, typelibGenerator, stats);

		// Watch files in case the watch mode is enabled.
		if (config.watch) {
			const { Watcher } = require("./lib/watcher");
			const watcher = new Watcher(config, typelibGenerator);
			watcher.watch();
		}
	}

	private async generate(
		changedFilesToRegenerate: string[],
		config: Config,
		typelibGenerator: TypelibGenerator,
		stats: CacheStats
	) {
		if (changedFilesToRegenerate.length === 0) {
			this.handleNoChangesDetected(config);
			return;
		}

		// SPAWN workers
		const workers = await this.spawnWorkers(changedFilesToRegenerate, config);

		const progressBar = this.createProgressBar(changedFilesToRegenerate);
		this.performanceTracker.init();
		await this.waitWorkersFinishedPromise(workers, progressBar);
		this.performanceTracker.metadataGenerated();

		this.flushWorkersLogBuffer(workers);
		await this.waitWorkersExitPromise(workers);

		await typelibGenerator.generate();
		this.performanceTracker.finish();

		this.logger.buffer.log("");
		this.logger.buffer.log(green("\u2713 Done"));

		this.printPerformanceInfo(config);
		this.performanceTracker.printPerformanceInfo();

		stats.value.lastGeneration = new Date();
		stats.persist();
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
		console.log("");
	}

	private handleNoChangesDetected(config: Config) {
		printNoChangesDetected(this.logger);
		this.performanceEntries.initialization = performance.now();
		this.printPerformanceInfo(config);
	}

	private createProgressBar(files: string[]) {
		const progressBar = new cliProgress.SingleBar(
			{
				stream: process.stdout,
				clearOnComplete: false,
				format: `\t[{bar}] ${blue("{percentage}")} % | ${blue("{value}")}/${blue("{total}")}`,
			},
			cliProgress.Presets.legacy
		);
		this.logger.log(LogLevel.Always, undefined, "Processing files...");
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
		const atLeastFilesPerWorker = 50;

		const cpuCount = Math.round(cpus().length / 3) || 1; // divided by 3 because of multiple threads per CPU (all new CPUs) and some space for other processes.
		const workerFileCount =
			fileNames.length > atLeastFilesPerWorker * cpuCount ? fileNames.length / cpuCount : atLeastFilesPerWorker;

		const workers = [];

		// Visit every sourceFile in the program
		for (let filesOffset = 0, cpu = 1; filesOffset < fileNames.length; cpu++) {
			// Get given number of files for this worker; or take the rest if this is the last worker.
			const files = fileNames.slice(
				filesOffset,
				fileNames.length - filesOffset < workerFileCount ? undefined : filesOffset + workerFileCount
			);

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

		// this.logger.debug("Workers spawned:", workers.length);

		return workers;
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
