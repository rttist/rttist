import { resolveSingletonInstance } from "./helpers";

class Importer {
	private readonly importMap: { [moduleId: string]: () => Promise<any> } = {};

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
		return this.importMap[moduleId]();
	}
}

export const ModuleImporter = resolveSingletonInstance("rttist/ModuleImporter", Importer);
