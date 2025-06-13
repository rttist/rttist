import { FsReadWriteOnlyStorage } from "./lib/cache/fs-read-write-only-storage";
import type { Config } from "./lib/config/config";
import type { Logger } from "./lib/logging";
import { MetadataGenerator } from "./lib/metadata-generator";
import type { FileFinishedWorkerMessagePayload, WorkerMessage } from "./declarations/worker-message";
import { WorkerMessageType } from "./declarations/worker-message-type";
import { resolvePath } from "./lib/utils/path";
import type { WorkerArguments } from "./declarations/worker-arguments";
import type { Worker } from "node:worker_threads";
import type { TypescriptProgramProvider } from "./typescript-program-provider";

// It has no benefit to spawn workers if the number of files is lower than this
const AT_LEAST_FILES_PER_WORKER = 50;

type WorkerSpawnResult = {
	worker: Worker;
	workerExitedPromise: Promise<unknown>;
	generationCompletedPromise: Promise<unknown>;
};

export class MetadataGeneratorSpawner {
	constructor(
		private readonly config: Config,
		private readonly logger: Logger,
		private readonly typescriptProgramProvider: TypescriptProgramProvider
	) {}

	public async generate(
		fileNames: string[],
		handlers?: { afterSetup?: () => void; moduleMetadataGenerated: () => void }
	) {
		if (fileNames.length === 0) {
			handlers?.afterSetup?.();
			return;
		}

		// If there is not many modules, do it without spawning Workers
		if (fileNames.length < AT_LEAST_FILES_PER_WORKER) {
			const metadataGenerator = new MetadataGenerator(
				this.config,
				this.typescriptProgramProvider,
				new FsReadWriteOnlyStorage(),
				new FsReadWriteOnlyStorage()
			);
			await metadataGenerator.generate(fileNames);
		}

		// SPAWN workers
		const workers = await this.spawnWorkers(fileNames);

		handlers?.afterSetup?.();
		await this.waitWorkersFinishedPromise(workers, handlers?.moduleMetadataGenerated);

		this.flushWorkersLogBuffer(workers);
		await this.waitWorkersExitPromise(workers);
	}

	private async getWorkerFileCount(fileNames: string[]) {
		// lazy import of "os" module
		const cpus = (await import("node:os")).cpus;

		// divided by 3 because of multiple threads per CPU (all new CPUs) and some space for other processes.
		const cpuCount = Math.round(cpus().length / 3) || 1;

		return fileNames.length > AT_LEAST_FILES_PER_WORKER * cpuCount
			? fileNames.length / cpuCount
			: AT_LEAST_FILES_PER_WORKER;
	}

	private async spawnWorkers(fileNames: string[]): Promise<WorkerSpawnResult[]> {
		const Worker = (await import("node:worker_threads")).Worker;
		const workerFileCount = await this.getWorkerFileCount(fileNames);
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

			const worker = this.spawn(this.config, files, this.logger, Worker);

			worker.workerExitedPromise.catch((error) => {
				this.logger.error("Worker failed.", error);
			});

			workers.push(worker);
		}

		// this.logger.debug("Workers spawned:", workers.length);

		return workers;
	}

	/**
	 * Create Promise waiting for all workers to finish generation; with progress update.
	 */
	private async waitWorkersFinishedPromise(workers: WorkerSpawnResult[], moduleMetadataGenerated?: () => void) {
		const results: FileFinishedWorkerMessagePayload[] = [];

		await Promise.all(
			workers.map((entry) => {
				entry.worker.on("message", (message: WorkerMessage) => {
					if (message.type === WorkerMessageType.FileFinished) {
						moduleMetadataGenerated?.();
						results.push(message as unknown as FileFinishedWorkerMessagePayload);
					}
				});

				return entry.generationCompletedPromise;
			})
		);

		return results;
	}

	/**
	 * Flush workers log buffers
	 */
	private flushWorkersLogBuffer(workers: any[]) {
		for (const worker of workers) {
			worker.worker.postMessage({ type: WorkerMessageType.FlushLogBuffer });
		}
	}

	/**
	 * Create Promise waiting for all workers to exit.
	 */
	private waitWorkersExitPromise(workers: any[]) {
		return Promise.all(workers.map((entry) => entry.workerExitedPromise));
	}

	private spawn(
		config: Config,
		files: string[],
		logger: Logger,
		Worker: typeof import("worker_threads").Worker
	): WorkerSpawnResult {
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
