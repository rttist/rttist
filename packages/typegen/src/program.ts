import type { CLI } from "./cli";
import { cpus } from "os";
import * as fs from "fs/promises";
import { Worker } from "worker_threads";
import { Config, getParsedConfig } from "./config/config";
import { WorkerArguments } from "./declarations/worker-arguments";
import { LogColor, Logger, LogLevel } from "./logging";
import { resolvePath } from "./utils/path";
import * as fastGlob from "fast-glob";
import * as cliProgress from "cli-progress";
import { MessageType } from "./workers-messaging";

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

		// Get all the source files
		const fileNames = await this.getFilesNames(config);

		// SPAWN workers
		const workers = this.spawnWorkers(fileNames, config);

		// Progress bar
		const progressBar = new cliProgress.SingleBar(
			{ stream: process.stdout, clearOnComplete: false },
			cliProgress.Presets.legacy
		);
		progressBar.start(fileNames.length, 0);

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

		// await new Promise((resolve) => setTimeout(resolve, 3000));
	}

	private spawnWorkers(fileNames: string[], config: Config) {
		const cpuCount = cpus().length;
		const workerFileCount = Math.floor(fileNames.length / cpuCount) || 1;

		const workers = [];
		// let workersFinished = 0;

		// Visit every sourceFile in the program
		for (let filesOffset = 0, cpu = 1; filesOffset < fileNames.length; filesOffset += workerFileCount, cpu++) {
			// Get given number of files for this worker; or take the rest if this is the last worker.
			const files = fileNames.slice(filesOffset, cpu === cpuCount ? undefined : filesOffset + workerFileCount);

			if (!files.length) {
				break;
			}

			const worker = this.spawn(config, files, this.logger);

			worker.promise
				.then(() => {
					// console.log("Worker finished");
					// workersFinished++;
				})
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
	private async getFilesNames(config: Config) {
		return await fastGlob.glob(config.include, {
			cwd: config.projectRoot,
			dot: false,
			onlyFiles: true,
			ignore: config.exclude,
			absolute: false,
		});
	}

	private spawn(config: Config, files: string[], logger: Logger) {
		if (config.devMode) {
			logger.trace("Spawning worker for files", files);
		}

		const args = {
			files: files,
			config: config,
			// partName: partName,
			// compilerOptions: config.compilerOptions,
		} satisfies WorkerArguments;

		const worker = new Worker(resolvePath(__dirname, "worker.js"), {
			workerData: args,
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
}
