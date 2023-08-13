import { resolveSingletonInstance } from "./resolveSingletonInstance";

class Importer {
	private readonly importMap: { [moduleId: string]: () => Promise<any> } = {};

	// noinspection JSUnusedGlobalSymbols; used in generated metadata
	/**
	 * Register importers.
	 * @param importMap
	 */
	registerImporters(importMap: { [moduleId: string]: () => Promise<any> }): void {
		Object.keys(importMap).forEach((moduleId) => {
			this.importMap[moduleId] = importMap[moduleId];
		});
	}

	/**
	 * Import a module.
	 * @param moduleId
	 */
	import(moduleId: string): Promise<undefined | { [exportName: string]: any }> {
		return this.importMap[moduleId]?.() ?? Promise.resolve(undefined);
	}
}

export const ModuleImporter = resolveSingletonInstance("rttist/ModuleImporter", () => new Importer());
