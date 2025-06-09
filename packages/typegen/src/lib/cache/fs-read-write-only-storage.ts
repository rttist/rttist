import $fs from "node:fs";
import * as fs from "node:fs/promises";
import { dirname } from "../utils/path";
import type { CachedStorage, CacheStorageEventHandler } from "./cached-storage";
import { R_OK, W_OK } from "node:constants";

/**
 * A storage implementation that reads and writes files to the filesystem,
 * without caching in the memory.
 */
export class FsReadWriteOnlyStorage implements CachedStorage {
	private readonly eventHandlers = new Map<keyof CacheStorageEventHandler, Array<(...args: any[]) => void>>();

	// constructor(private readonly config: Config) {}

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
	invalidate(fileName: string): void {}

	/**
	 * @inheritDoc
	 * @param fileName
	 */
	async read(fileName: string): Promise<string | null> {
		return await fs.readFile(fileName, { encoding: "utf-8" });
	}

	/**
	 * @inheritDoc
	 * @param fileName
	 */
	readSync(fileName: string): string | null {
		return $fs.readFileSync(fileName, { encoding: "utf-8" });
	}

	/**
	 * @inheritDoc
	 * @param fileName
	 * @param content
	 */
	async write(fileName: string, content: string): Promise<void> {
		try {
			return await fs.writeFile(fileName, content, { encoding: "utf-8" });
		} catch (e) {
			// Try to create dir in case it is missing
			const fileMetadataDirname = dirname(fileName);
			await fs.mkdir(fileMetadataDirname, { recursive: true });

			// Retry writing the file after creating the directory
			return await fs.writeFile(fileName, content, { encoding: "utf-8" });
		}
	}
}
