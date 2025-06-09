import type { Entry } from "fast-glob";
import * as FastGlob from "fast-glob";
import type { CacheStats } from "./lib/cache/cache-stats";
import type { Config } from "./lib/config/config";

let entriesEventLoopCache: Entry[] | undefined;

export const projectFilesProvider: {
	getSourceFilesWithStats(config: Config): Promise<Entry[]>;
	getFilesToRegenerate(fileEntries: FastGlob.Entry[], config: Config, stats: CacheStats): string[];
} = {
	/**
	 * Match source files by configured glob patterns.
	 * @param config
	 * @private
	 */
	async getSourceFilesWithStats(config: Config): Promise<Entry[]> {
		entriesEventLoopCache = await FastGlob.glob(config.include, {
			...getSourceFilesGlobOptions(config),
			stats: true,
		});

		setTimeout(() => {
			entriesEventLoopCache = undefined; // Clear cache after the event loop tick
		});

		return entriesEventLoopCache;
	},

	getFilesToRegenerate(fileEntries: Entry[], config: Config, stats: CacheStats): string[] {
		// Filter out files that have not been modified since last generation
		const files = config.force
			? fileEntries
			: fileEntries.filter((entry) => !entry.stats || entry.stats.mtime > stats.value.lastGeneration);

		return files.map((entry) => entry.path);
	},
};

function getSourceFilesGlobOptions(config: Config) {
	return {
		cwd: config.projectRoot,
		dot: false,
		onlyFiles: true,
		ignore: config.exclude,
		absolute: false,
		followSymbolicLinks: true,
	};
}
