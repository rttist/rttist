export type InvalidateCachedStorageEventHandler = (fileName: string) => void;

export type CacheStorageEventHandler = {
	invalidate: InvalidateCachedStorageEventHandler;
};

export interface CachedStorage {
	/**
	 * Allows
	 * @param eventName
	 * @param handler
	 */
	on<TEventName extends keyof CacheStorageEventHandler>(
		eventName: TEventName,
		handler: CacheStorageEventHandler[TEventName]
	): void;

	/**
	 * Persist file
	 * @param fileName
	 * @param content
	 */
	write(fileName: string, content: string): Promise<void>;

	/**
	 * Read file
	 * @param fileName
	 */
	read(fileName: string): Promise<string | null>;

	/**
	 * Read file
	 * @param fileName
	 */
	readSync(fileName: string): string | null;

	/**
	 * Verify that file exists in the cache storage
	 * @param fileName
	 */
	has(fileName: string): Promise<boolean>;

	/**
	 * Invalidate file
	 * @param fileName
	 */
	invalidate(fileName: string): void;
}
