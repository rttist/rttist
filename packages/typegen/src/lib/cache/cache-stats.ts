import type { Logger } from "../logging";
import type { Config } from "../config/config";
import { resolvePath } from "../utils/path";
import * as $fs from "node:fs";

export type CacheStatsProps = {
	lastGeneration: Date;
};

const JSON_DATE_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?/;

export class CacheStats {
	private _value: CacheStatsProps = {
		lastGeneration: new Date(0, 0),
	};

	get value() {
		return this._value;
	}

	constructor(
		private readonly config: Config,
		private readonly logger: Logger
	) {
		this.loadCachedStats();
	}

	persist() {
		const statsPath = resolvePath(this.config.cacheDir, "stats.json");
		$fs.writeFileSync(statsPath, JSON.stringify(this._value, null, 4), "utf-8");
	}

	private loadCachedStats() {
		const statsPath = resolvePath(this.config.cacheDir, "stats.json");
		let stats = "{}";

		try {
			stats = $fs.readFileSync(statsPath, "utf-8");
		} catch (e) {}

		try {
			this._value = {
				...this._value,
				...(JSON.parse(stats, (key, value) => {
					if (typeof value === "string") {
						const match = value.match(JSON_DATE_REGEX);

						if (match) {
							return new Date(match[0]);
						}
					}
					return value;
				}) as CacheStats),
			};
		} catch (error) {
			this.logger.error("Failed to parse 'stats.json' from the cache folder.", error);
			throw error;
		}
	}
}
