import type { ModuleReference } from "../declarations";
import type { MetadataLibrary } from "../MetadataLibrary";
import type { Module } from "../Module";
import { MetadataScope } from "../metadata-scope";

/**
 * @internal
 */
export class LazyModuleArray<TModule = Module> {
	private readonly _references: ReadonlyArray<ModuleReference>;
	private _modules?: ReadonlyArray<TModule>;
	private readonly metadataLibrary: MetadataLibrary = MetadataScope.current;

	public readonly length: number;

	get modules(): ReadonlyArray<TModule> {
		this._modules ??= Object.freeze(
			this._references.map((module) => this.metadataLibrary.resolveModule(module) as TModule)
		);
		return this._modules;
	}

	constructor(moduleRefs: ReadonlyArray<ModuleReference>) {
		this._references = moduleRefs;
		this.length = moduleRefs.length;
	}
}
