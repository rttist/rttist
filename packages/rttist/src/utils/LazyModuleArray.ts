import type { ModuleReference } from "../declarations";
import type { Module }          from "../Module";
import { LazyModule }           from "./LazyModule";

/**
 * @internal
 */
export class LazyModuleArray<TModule = Module>
{
	private readonly _references: ReadonlyArray<ModuleReference>;
	private _modules?: ReadonlyArray<TModule>;

	public readonly length: number;

	get modules(): ReadonlyArray<TModule>
	{
		return this._modules ?? (this._modules = Object.freeze(
			this._references.map(module => LazyModule.resolver(module) as TModule)
		));
	}

	constructor(moduleRefs: ReadonlyArray<ModuleReference>)
	{
		this._references = moduleRefs;
		this.length = moduleRefs.length;
	}
}