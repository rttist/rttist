import { startTime } from "./performance-import-time-start"; // Keep first
import { Entry } from "fast-glob";
import { startCacheServer } from "memory-mapped-files";
import type { CLI } from "./cli";
import { cpus } from "os";
import * as fs from "fs/promises";
import { Worker } from "worker_threads";
import { WorkerMessage } from "./declarations/worker-message";
import { Config, getParsedConfig } from "./lib/config/config";
import { CacheStats } from "./declarations/cache-stats";
import { WorkerArguments } from "./declarations/worker-arguments";
import { LogColor, Logger, LogLevel } from "./lib/logging";
import { LogBuffer } from "./lib/logging/log-buffer";
import { TypelibGenerator } from "./lib/typelib-generator";
import { resolvePath } from "./lib/utils/path";
import * as fastGlob from "fast-glob";
import * as cliProgress from "cli-progress";
import { Watcher } from "./lib/watcher";
import { WorkerMessageType } from "./declarations/worker-message-type";
import PromiseSource from "promise-cs";

const JSON_DATE_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?/;

// TODO: Refactor this file. Separate base build, spawning and watching.

export class Program {
	private readonly logger = new Logger("Program", undefined, LogBuffer.autoFlush);
	private readonly performanceEntries: {
		parseStart: number;
		start: number;
		initialization?: number;
		completed?: number;
	} = {
		parseStart: startTime,
		start: performance.now(),
	};
	private stats: CacheStats = {
		lastGeneration: new Date(0, 0),
	};

	constructor(private readonly cli: CLI) {}

	private async getConfig(): Promise<Config> {
		return await getParsedConfig(this.cli.getCommandLineArguments());
	}

	public async run(): Promise<void> {
		const config = await this.getConfig();

		// Logger.setGlobalPrefix("@rttist/typegen");
		Logger.setLevel(config.logLevel);

		this.logger.log(LogLevel.Info, LogColor.blue, "Project root: " + config.projectRoot);
		this.logger.log(LogLevel.Info, LogColor.blue, "TypeScript root directory: " + config.tsRootDir);

		// run MMF cache server
		startCacheServer(config.tsRootDir, ["**/*.ts", "**/*.tsx", "**/*.d.ts"]);

		const allFiles = await this.getSourceFilesWithStats(config);
		const allFilesPath = allFiles.map((x) => x.path);
		const completedPS = new PromiseSource();
		const typelibGenerator = new TypelibGenerator(config, allFilesPath);

		// Watch files in case the watch mode is enabled.
		if (config.watch) {
			const watcher = new Watcher(config, typelibGenerator, completedPS);
			watcher.watch(allFilesPath);
		}

		await this.loadCachedStats(config);

		// Filter files to regenerate (files with changes after last generation).
		const filesToProcess = await this.getFilesToRegenerate(allFiles, config);
		// SPAWN workers
		const workers = this.spawnWorkers(filesToProcess, config);
		// Progress bar
		const progressBar = this.createProgressBar(filesToProcess);

		// Capture initialization time
		this.performanceEntries.initialization = performance.now();

		// Wait for workers to finish generation
		await Promise.all(
			workers.map((entry) => {
				entry.worker.on("message", (message) => {
					if (message.type === WorkerMessageType.FileFinished) {
						progressBar.increment();
					}
				});

				return entry.generationCompletedPromise;
			})
		);

		progressBar.stop();

		// Flush workers log buffers
		workers.forEach((worker) => {
			worker.worker.postMessage({ type: WorkerMessageType.FlushLogBuffer });
		});

		// Wait for workers to exit
		await Promise.all(workers.map((entry) => entry.workerExitedPromise));

		if (filesToProcess.length > 0) {
			// await generateTypelibFiles(
			// 	allFiles.map((x) => x.path),
			// 	config
			// );
			await typelibGenerator.generate();
			// TODO generate bundles too
		}

		this.performanceEntries.completed = performance.now();
		this.printPerformanceInfo(config);

		if (filesToProcess.length > 0) {
			this.stats.lastGeneration = new Date();
			await this.persistStats(config);
		}

		completedPS.resolve();
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

	private async getFilesToRegenerate(allFiles: Entry[], config: Config) {
		// Filter out files that have not been modified since last generation
		const files = config.force
			? allFiles
			: allFiles.filter((entry) => !entry.stats || entry.stats.mtime > this.stats.lastGeneration);

		return files.map((entry) => entry.path);
	}

	private spawnWorkers(fileNames: string[], config: Config) {
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

			const worker = this.spawn(config, files, this.logger);

			worker.workerExitedPromise
				// .then(() => {
				// 	// console.log("Worker finished");
				// })
				.catch((error) => {
					this.logger.error("Worker failed.", error);
				});

			workers.push(worker);
		}

		this.logger.info("Workers spawned:", workers.length);

		return workers;
	}

	private printPerformanceInfo(config: Config) {
		this.logger.log(
			config.devMode ? LogLevel.Dev : LogLevel.Debug,
			LogColor.magenta,
			"Completed!",

			"\n\tImporting modules:",
			roundPerfTime(this.performanceEntries.start - this.performanceEntries.parseStart),
			"sec.",

			"\n\tInitialization:",
			roundPerfTime((this.performanceEntries.initialization ?? 0) - this.performanceEntries.start),
			"sec.",

			"\n\tGenerating metadata:",
			roundPerfTime((this.performanceEntries.completed ?? 0) - (this.performanceEntries.initialization ?? 0)),
			"sec.",
			// "\n\tType discovery and transformations:",
			// this.roundPerfTime(total - this.perfEntries[0] - this.perfEntries[1]),
			// "sec.",

			// "\n\tSerialization and emitting of metadata:",
			// this.roundPerfTime(this.perfEntries[1]),
			// "sec.",

			"\n\tTotal time:",
			roundPerfTime((this.performanceEntries.completed ?? 0) - this.performanceEntries.parseStart),
			"sec."

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
		return await fastGlob.glob(config.include, {
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

	private spawn(config: Config, files: string[], logger: Logger) {
		if (config.devMode) {
			logger.trace("Spawning worker for files", files);
		}

		const worker = new Worker(resolvePath(__dirname, "worker.js"), {
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

	private async persistStats(config: Config) {
		const statsPath = resolvePath(config.cacheDir, "stats.json");
		await fs.writeFile(statsPath, JSON.stringify(this.stats, null, 4), "utf-8");
	}

	private async loadCachedStats(config: Config): Promise<void> {
		const statsPath = resolvePath(config.cacheDir, "stats.json");
		const stats = await fs.readFile(statsPath, "utf-8").catch(() => undefined);

		try {
			this.stats = {
				...this.stats,
				...(JSON.parse(stats ?? "{}", function (key, value) {
					if (typeof value === "string") {
						let match = value.match(JSON_DATE_REGEX);

						if (match) {
							return new Date(match[0]);
						}
					}
					return value;
				}) as CacheStats),
			};
		} catch (error) {
			this.logger.error("Failed to parse stats file.", error);
			throw error;
		}
	}
}
