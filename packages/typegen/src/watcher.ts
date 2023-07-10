import * as chokidar from "chokidar";
import { FSWatcher } from "chokidar";
import PromiseSource from "promise-cs";
import { Config } from "./config/config";
import { generateModulesMetadata } from "./generator/generate-modules-metadata";
import { generateTypelibFiles } from "./generator/generate-typelib-files";
import { Logger } from "./logging";
import { resolvePath } from "./utils/path";

export class Watcher {
	private readonly allFiles: Set<string> = new Set<string>();
	private readonly logger = new Logger("Watcher");
	private _watcher?: FSWatcher;
	private regenerateInterval?: NodeJS.Timeout;
	private regenerateTypelibs = false;
	private readyToWatch = false;

	private get watcher() {
		if (!this._watcher) {
			this._watcher = this.createWatcher();
		}
		return this._watcher;
	}

	constructor(
		private readonly config: Config,
		private readonly completedPS: PromiseSource<void>
	) {
		this.regenerateIntervalHandler = this.regenerateIntervalHandler.bind(this);
	}

	/**
	 * Start watching files.
	 * @param files
	 */
	watch(files: string[]) {
		// Add files to the set of all files.
		files.forEach((file) => this.allFiles.add(file));

		const filesTouchedWhileInitialGeneration = new Set<string>();

		this.startRegenerateInterval();
		this.clearOnKill();
		this.registerEventHandlers(filesTouchedWhileInitialGeneration);

		this.completedPS.promise
			.then(async () => {
				this.logger.info("Watching for file changes...");

				if (filesTouchedWhileInitialGeneration.size > 0) {
					this.logger.info(
						"File change detected. Starting incremental compilation...",
						filesTouchedWhileInitialGeneration
					);

					generateModulesMetadata(
						Array.from(filesTouchedWhileInitialGeneration),
						this.config,
						(filename) => {}
					);
					this.regenerateTypelibs = true;
				}
			})
			.catch((error) => {
				this.logger.error(error);
			});
	}

	private createWatcher() {
		return chokidar.watch(this.config.include, {
			ignored: this.config.exclude,
			cwd: this.config.projectRoot,
		});
	}

	/**
	 * Start interval which regenerates typelib files after changes.
	 */
	private startRegenerateInterval() {
		this.regenerateInterval = setInterval(this.regenerateIntervalHandler, 100);
	}

	private async regenerateIntervalHandler() {
		try {
			if (!this.regenerateTypelibs) {
				// Skip if the regenerate is not requested.
				return;
			}

			// Reset the regenerate flag.
			this.regenerateTypelibs = false;

			// Clear interval to prevent multiple regenerations.
			clearInterval(this.regenerateInterval);

			await generateTypelibFiles(Array.from(this.allFiles), this.config);

			this.startRegenerateInterval();
		} catch (err) {
			this.logger.error(err);
		}
	}

	private clearOnKill() {
		const clear = () => {
			this.watcher.close().catch(() => {});

			if (this.regenerateInterval) {
				clearInterval(this.regenerateInterval);
			}
		};

		process.on("SIGINT", clear);
		process.on("SIGTERM", clear);
	}

	// private setupWatch() {
	//
	// }

	private registerEventHandlers(filesTouchedWhileInitialGeneration: Set<string>) {
		this.watcher
			.on("add", (path) => {
				// Check ready status; all files are "added" on start; maybe bug of chokidar?
				if (!this.readyToWatch) {
					return;
				}

				this.allFiles.add(path);

				if (!this.completedPS.completed) {
					filesTouchedWhileInitialGeneration.add(path);
					return;
				}

				this.regenerateMetadata([path]);
			})
			.on("change", (path) => {
				if (!this.completedPS.completed) {
					filesTouchedWhileInitialGeneration.add(path);
					return;
				}

				this.regenerateMetadata([path]);
			})
			.on("unlink", (path) => {
				this.allFiles.delete(path);

				// TODO: Delete metadata from the cache folder

				this.regenerateMetadata([]);
			})
			.on("unlinkDir", (dirPath) => {
				Array.from(this.allFiles)
					.filter((path) => path.startsWith(dirPath))
					.forEach((path) => {
						this.allFiles.delete(path);
						// TODO: Delete metadata from the cache folder
					});

				this.regenerateMetadata([]);
			})
			.on("ready", () => {
				this.readyToWatch = true;
			});
	}

	private regenerateMetadata(paths: string[]) {
		this.logger.info("File change detected. Starting incremental compilation...");

		// Regenerate metadata of given files.
		if (paths.length > 0) {
			generateModulesMetadata(
				paths.map((path) => resolvePath(this.config.projectRoot, path)),
				this.config,
				(filename) => {
					this.logger.info(`Regenerated metadata`, filename);
				}
			);
		}

		// Flag to regenerate typelib files.
		this.regenerateTypelibs = true;
	}
}
