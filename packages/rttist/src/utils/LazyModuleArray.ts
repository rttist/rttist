import type { ModuleReference } from "../declarations";
import type { MetadataLibrary } from "../Metadata";
import type { Module } from "../Module";

/**
 * @internal
 */
export class LazyModuleArray<TModule = Module> {
	private readonly _references: ReadonlyArray<ModuleReference>;
	private _modules?: ReadonlyArray<TModule>;

	public readonly length: number;

	get modules(): ReadonlyArray<TModule> {
		return (
			this._modules ??
			(this._modules = Object.freeze(
				this._references.map((module) => this.metadataLibrary.resolveModule(module) as TModule)
			))
		);
	}

	constructor(
		private readonly metadataLibrary: MetadataLibrary,
		moduleRefs: ReadonlyArray<ModuleReference>
	) {
		this._references = moduleRefs;
		this.length = moduleRefs.length;
	}
}
