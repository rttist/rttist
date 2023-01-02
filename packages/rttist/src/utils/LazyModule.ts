import type { ModuleReference } from "../declarations";
import type { Module }          from "../Module";

/**
 * @internal
 */
export type ModuleResolver = (moduleRef: ModuleReference) => Module;

/**
 * @internal
 */
export class LazyModule
{
	public static resolver: ModuleResolver = () => {
		throw new Error("ModuleResolver.resolver not set.");
	};

	private readonly _reference: ModuleReference;
	private _module?: Module;

	get module(): Module
	{
		return this._module ?? (this._module = LazyModule.resolver(this._reference));
	}

	constructor(moduleRef: ModuleReference)
	{
		if (!moduleRef)
		{
			throw new Error("Invalid module reference.");
		}

		this._reference = moduleRef;
	}
}