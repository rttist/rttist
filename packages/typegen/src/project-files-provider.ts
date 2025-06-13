import type { Entry } from "fast-glob";
import * as FastGlob from "fast-glob";
import type { CacheStats } from "./lib/cache/cache-stats";
import type { Config } from "./lib/config/config";
import { isMatch } from "micromatch";
import { toNormalizedProjectPath, toNormalizedRelativeProjectPath } from "./lib/utils/path";

let entriesEventLoopCache: Entry[] | undefined;

export const projectFilesProvider = {
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

		// Normalize paths; FastGlob returns relative paths from CWD
		for (const entry of entriesEventLoopCache) {
			entry.path = toNormalizedProjectPath(entry.path, config);
		}

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

	isProjectFile(file: string, config: Config): boolean {
		const path = toNormalizedRelativeProjectPath(file, config);

		const options = {
			cwd: config.projectRoot,
			dot: false,
			ignore: config.exclude,
		};

		for (const includePattern of config.include) {
			if (isMatch(path, includePattern, options)) {
				return true;
			}
		}

		return false;
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
