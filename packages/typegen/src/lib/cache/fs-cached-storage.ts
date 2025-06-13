import $fs from "node:fs";
import fs from "node:fs/promises";
import type { Config } from "../config/config";
import { dirname, toNormalizedProjectPath } from "../utils/path";
import type { CachedStorage, CacheStorageEventHandler } from "./cached-storage";
import { R_OK, W_OK } from "node:constants";

export class FsCachedStorage implements CachedStorage {
	private readonly eventHandlers = new Map<keyof CacheStorageEventHandler, Array<(...args: any[]) => void>>();
	private readonly cache = new Map<string, string>();

	constructor(private readonly config: Config) {}

	on<TEventName extends keyof CacheStorageEventHandler>(
		eventName: TEventName,
		handler: CacheStorageEventHandler[TEventName]
	): void {
		let handlers = this.eventHandlers.get(eventName);

		if (!handlers) {
			handlers = [];
			this.eventHandlers.set(eventName, handlers);
		}

		handlers.push(handler);
	}

	/**
	 * @inheritDoc
	 * @param fileName
	 */
	async has(fileName: string): Promise<boolean> {
		fileName = toNormalizedProjectPath(fileName, this.config);

		if (this.cache.has(fileName)) {
			return true;
		}

		try {
			await fs.access(fileName, R_OK | W_OK);
			return true;
		} catch (e) {}

		return false;
	}

	/**
	 * @inheritDoc
	 * @param fileName
	 */
	invalidate(fileName: string): void {
		fileName = toNormalizedProjectPath(fileName, this.config);

		this.cache.delete(fileName);

		const handlers = this.eventHandlers.get("invalidate");

		if (handlers) {
			for (const handler of handlers) {
				handler(fileName);
			}
		}
	}

	updateMemoryCacheOnly(fileName: string, content: string): void {
		fileName = toNormalizedProjectPath(fileName, this.config);

		this.cache.set(fileName, content);
	}

	/**
	 * @inheritDoc
	 * @param fileName
	 */
	async read(fileName: string): Promise<string | null> {
		fileName = toNormalizedProjectPath(fileName, this.config);
		const cacheHit = this.cache.get(fileName);

		if (cacheHit) {
			return cacheHit;
		}

		const fsHit = await fs.readFile(fileName, { encoding: "utf-8" });
		this.cache.set(fileName, fsHit);

		return fsHit;
	}

	/**
	 * @inheritDoc
	 * @param fileName
	 */
	readSync(fileName: string): string | null {
		fileName = toNormalizedProjectPath(fileName, this.config);
		const cacheHit = this.cache.get(fileName);

		if (cacheHit) {
			return cacheHit;
		}

		const fsHit = $fs.readFileSync(fileName, { encoding: "utf-8" });
		this.cache.set(fileName, fsHit);

		return fsHit;
	}

	/**
	 * @inheritDoc
	 * @param fileName
	 * @param content
	 */
	async write(fileName: string, content: string): Promise<void> {
		fileName = toNormalizedProjectPath(fileName, this.config);

		try {
			this.cache.set(fileName, content);
			await fs.writeFile(fileName, content, { encoding: "utf-8" });
		} catch (e) {
			// Try to create dir in case it is missing
			const fileMetadataDirname = dirname(fileName);
			await fs.mkdir(fileMetadataDirname, { recursive: true });

			// Retry writing the file after creating the directory
			await fs.writeFile(fileName, content, { encoding: "utf-8" });
		}

		const handlers = this.eventHandlers.get("write");

		if (handlers) {
			for (const handler of handlers) {
				handler(fileName);
			}
		}
	}
}
