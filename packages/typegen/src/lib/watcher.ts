import type { FSWatcher } from "chokidar";
import type { Config } from "./config/config";
import * as chokidar from "chokidar";
import { Logger } from "./logging";
import { TypelibGenerator } from "./typelib-generator";
import { MetadataGenerator } from "./metadata-generator";
import { LogBuffer } from "./logging/log-buffer";
import { resolveSourceFileCachePath } from "./utils/resolve-sourcefile-cache-path";
import * as fs from "fs";

export class Watcher {
	private readonly logger = new Logger("Watcher", undefined, LogBuffer.autoFlush);
	private readonly metadataGenerator: MetadataGenerator;

	private watcher?: FSWatcher;
	private readyToWatch = false;

	constructor(
		private readonly config: Config,
		private readonly typelibGenerator: TypelibGenerator
	) {
		this.metadataGenerator = new MetadataGenerator(this.config);

		this.metadataGenerator.on("write", (sourceFilePath, metadataPath) => {
			this.logger.info(`Regenerated metadata of file`, sourceFilePath);
		});
	}

	/**
	 * Start watching files.
	 */
	watch() {
		this.watcher = this.createWatcher();
		this.clearOnKill();
		this.registerEventHandlers();

		this.logger.info("Watching for file changes...");
	}

	private createWatcher() {
		return chokidar.watch(this.config.include, {
			ignored: this.config.exclude,
			cwd: this.config.projectRoot,
		});
	}

	private clearOnKill() {
		const clear = () => {
			this.watcher?.close().catch(() => {});
		};

		process.on("SIGINT", clear);
		process.on("SIGTERM", clear);
	}

	private registerEventHandlers() {
		this.watcher
			?.on("add", async (path) => {
				// Check ready status; all files are "added" on start; maybe bug of chokidar?
				if (!this.readyToWatch) {
					return;
				}

				await this.regenerateMetadata([path]);
				await this.typelibGenerator.fileAdded(path);
			})
			.on("change", async (path) => {
				await this.regenerateMetadata([path]);
				await this.typelibGenerator.fileChanged(path);
			})
			.on("unlink", async (path) => {
				try {
					fs.unlinkSync(resolveSourceFileCachePath(path, this.config));
				} catch (e) {}

				await this.regenerateMetadata([]);
				await this.typelibGenerator.filesRemoved([path]);
			})
			.on("unlinkDir", async (dirPath) => {
				const removedFiles = Array.from(this.typelibGenerator.getProjectFiles()).filter((path) =>
					path.startsWith(dirPath)
				);

				removedFiles.forEach((path) => {
					try {
						fs.unlinkSync(resolveSourceFileCachePath(path, this.config));
					} catch (e) {}
				});

				await this.regenerateMetadata([]);
				await this.typelibGenerator.filesRemoved(removedFiles);
			})
			.on("ready", () => {
				this.readyToWatch = true;
			});
	}

	private async regenerateMetadata(paths: string[]) {
		this.logger.info("File change detected. Starting incremental compilation...");

		// Regenerate metadata of given files.
		if (paths.length > 0) {
			await this.metadataGenerator.generate(paths);
		}
	}
}
