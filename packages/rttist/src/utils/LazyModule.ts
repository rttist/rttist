import type { ModuleReference } from "../declarations";
import type { MetadataLibrary } from "../MetadataLibrary";
import type { Module } from "../Module";
import { MetadataScope } from "../metadata-scope";

/**
 * @internal
 */
export class LazyModule {
	private readonly _reference: ModuleReference;
	private _module?: Module;
	private readonly metadataLibrary: MetadataLibrary = MetadataScope.current;

	get module(): Module {
		return this._module ?? (this._module = this.metadataLibrary.resolveModule(this._reference));
	}

	constructor(moduleRef: ModuleReference) {
		if (!moduleRef) {
			throw new Error("Invalid module reference.");
		}

		this._reference = moduleRef;
	}
}
