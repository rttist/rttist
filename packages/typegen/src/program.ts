import { FSWatcher } from "chokidar";
import type { CLI } from "./cli";
import { cpus } from "os";
import * as fs from "fs/promises";
import { Worker } from "worker_threads";
import { Config, getParsedConfig } from "./config/config";
import { CacheStats } from "./declarations/cache-stats";
import { WorkerArguments } from "./declarations/worker-arguments";
import { LogColor, Logger, LogLevel } from "./logging";
import { resolvePath } from "./utils/path";
import * as fastGlob from "fast-glob";
import * as cliProgress from "cli-progress";
import { MessageType } from "./workers-messaging";
import * as chokidar from "chokidar";
import PromiseSource from "promise-cs";

const JSON_DATE_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?/;

export class Program {
	// private readonly cliArgs: CommandLineArguments;
	// private readonly tsConfig: ts.ParsedCommandLine;
	private readonly logger: Logger;
	private readonly performanceEntries: {
		start: number;
		initialization?: number;
		completed?: number;
	} = {
		start: performance.now(),
	};
	// private readonly config: ProgramConfig;
	private stats: CacheStats = {
		lastGeneration: new Date(0, 0),
	};

	constructor(private readonly cli: CLI) {
		Logger.setGlobalPrefix("@rttist/typegen");

		this.logger = new Logger("Program");
		// this.config = this.getProgramConfig();
	}

	private getConfig(): Promise<Config> {
		const cliArguments = this.cli.getCommandLineArguments();
		return getParsedConfig(cliArguments);

		// const tsConfig = getTsConfig(cliArguments);
		//
		// return {
		// 	rootDir: dirname(cliArguments.project),
		// 	options: cliArguments,
		// 	tsConfig: tsConfig,
		// };
	}

	public async run(): Promise<void> {
		const config = await this.getConfig();

		this.logger.log(LogLevel.Info, LogColor.blue, "Detected project root: " + config.projectRoot);

		// Make sure that metadata cache directory exists
		await this.ensureCacheDirectoryExists(config);

		const completed = new PromiseSource();
		this.setupWatch(config, completed);
		await this.loadCachedStats(config);
		const files = await this.getFilesToRegenerate(config);

		// SPAWN workers
		const workers = this.spawnWorkers(files, config);

		// Progress bar
		const progressBar = new cliProgress.SingleBar(
			{
				stream: process.stdout,
				clearOnComplete: false,
				format: "processing files [{bar}] {percentage}% | {value}/{total}",
			},
			cliProgress.Presets.legacy
		);
		progressBar.start(files.length, 0);

		// Capture initialization time
		this.performanceEntries.initialization = performance.now();

		// Wait for workers to finish
		await Promise.all(
			workers.map((entry) => {
				entry.worker.on("message", (message) => {
					if (message.type === MessageType.FileFinished) {
						progressBar.increment();
					}
				});

				return entry.promise;
			})
		);

		progressBar.stop();
		this.performanceEntries.completed = performance.now();
		this.logPerformanceInfo(config);

		this.stats.lastGeneration = new Date();
		await this.persistStats(config);

		completed.resolve();
	}

	private async getFilesToRegenerate(config: Config) {
		// Get all the source files
		const allFiles = await this.getSourceFiles(config);

		// Filter out files that have not been modified since last generation
		const files = config.force
			? allFiles
			: allFiles.filter((entry) => !entry.stats || entry.stats.mtime > this.stats.lastGeneration);

		return files.map((entry) => entry.path);
	}

	private spawnWorkers(fileNames: string[], config: Config) {
		const cpuCount = cpus().length;
		const workerFileCount = Math.floor(fileNames.length / cpuCount) || 1;

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

			worker.promise
				// .then(() => {
				// 	// console.log("Worker finished");
				// })
				.catch((error) => {
					this.logger.error("Worker failed.", error);
				});

			workers.push(worker);
		}

		return workers;
	}

	private logPerformanceInfo(config: Config) {
		this.logger.log(
			config.devMode ? LogLevel.Dev : LogLevel.Debug,
			LogColor.magenta,
			"Completed!",
			"\n\tInitialization:",
			roundPerfTime(this.performanceEntries.initialization ?? 0 - this.performanceEntries.start),
			"sec.",

			// "\n\tType discovery and transformations:",
			// this.roundPerfTime(total - this.perfEntries[0] - this.perfEntries[1]),
			// "sec.",

			// "\n\tSerialization and emitting of metadata:",
			// this.roundPerfTime(this.perfEntries[1]),
			// "sec.",

			"\n\tTotal time:",
			roundPerfTime(this.performanceEntries.completed ?? 0 - this.performanceEntries.start),
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

	private async ensureCacheDirectoryExists(config: Config) {
		// Create cache folder
		await fs.mkdir(resolvePath(config.projectRoot, ".metadata"), { recursive: true });
	}

	/**
	 * Match source files by configured glob patterns.
	 * @param config
	 * @private
	 */
	private async getSourceFiles(config: Config) {
		return await fastGlob.glob(config.include, {
			cwd: config.projectRoot,
			dot: false,
			onlyFiles: true,
			ignore: config.exclude,
			absolute: false,
			stats: true,
			followSymbolicLinks: true,
		});
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
			promise: new Promise((resolve, reject) => {
				try {
					// worker.on("message", resolve);
					worker.on("error", reject);
					worker.on("exit", (code) => {
						if (code !== 0) {
							reject(new Error(`Worker stopped with exit code ${code}`));
						}
						resolve(undefined);
					});
				} catch (error) {
					reject(error);
				}
			}),
		};
	}

	private setupWatch(config: Config, completedPS: PromiseSource<void>) {
		if (!config.watch) {
			return false;
		}

		const watcher = chokidar.watch(config.include, { ignored: config.exclude, cwd: config.projectRoot });
		const filesTouchedWhileInitialGeneration = new Set<string>();
		const state = {
			completed: false,
			ready: false,
		};

		this.registerEventHandlers(watcher, state, filesTouchedWhileInitialGeneration);
		this.closeOnKill(watcher);

		completedPS.promise.then(() => {
			state.completed = true;

			this.logger.info("Watching for file changes...");

			if (filesTouchedWhileInitialGeneration.size > 0) {
				this.logger.info("Files change detected...", filesTouchedWhileInitialGeneration);
				// TODO: Regenerate metadata for these files
			}
		});
	}

	private registerEventHandlers(
		watcher: FSWatcher,
		state: { ready: boolean; completed: boolean },
		filesTouchedWhileInitialGeneration: Set<string>
	) {
		watcher
			.on("add", (path) => {
				// Check ready status; all files are "added" on start; maybe bug of chokidar?
				if (!state.ready) {
					return;
				}

				if (!state.completed) {
					filesTouchedWhileInitialGeneration.add(path);
					return;
				}

				// TODO: Regenerate metadata for this file
			})
			.on("change", (path) => {
				if (!state.completed) {
					filesTouchedWhileInitialGeneration.add(path);
					return;
				}

				// TODO: Regenerate metadata for this file
			})
			.on("ready", () => {
				state.ready = true;
			});
	}

	private closeOnKill(watcher: FSWatcher) {
		process.on("SIGINT", () => {
			watcher.close().catch(() => {});
		});

		process.on("SIGTERM", () => {
			watcher.close().catch(() => {});
		});
	}

	private async persistStats(config: Config) {
		const statsPath = resolvePath(config.projectRoot, ".metadata", "stats.json");
		await fs.writeFile(statsPath, JSON.stringify(this.stats, null, 4), "utf-8");
	}

	private async loadCachedStats(config: Config): Promise<void> {
		const statsPath = resolvePath(config.projectRoot, ".metadata", "stats.json");
		const stats = await fs.readFile(statsPath, "utf-8");

		try {
			this.stats = JSON.parse(stats, function (key, value) {
				if (typeof value === "string") {
					let match = value.match(JSON_DATE_REGEX);

					if (match) {
						return new Date(match[0]);
					}
				}
				return value;
			}) as CacheStats;
		} catch (error) {
			this.logger.error("Failed to parse stats file.", error);
			throw error;
		}
	}
}
