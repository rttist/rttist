import { ModuleIds }             from "@rttist/core";
import type { ModuleIdentifier } from "./declarations";
import type { Type }             from "./Type";

export interface ModuleMetadata
{
	id: ModuleIdentifier;
	name: string;
	path: string;
	children?: Module[];
	types?: Type[];
}

export class Module
{
	/**
	 * Module for all the native types.
	 */
	public static readonly Native: Module = new Module({ id: ModuleIds.Native, name: "native", path: "typescript" });

	/**
	 * Module for dynamic types without specific module.
	 */
	public static readonly Dynamic: Module = new Module({ id: ModuleIds.Dynamic, name: "dynamic", path: "" });

	/**
	 * Unknown module.
	 */
	public static readonly Invalid: Module = new Module({ id: ModuleIds.Invalid, name: "invalid", path: "" });

	private readonly _children: Module[];
	private readonly _types: Type[];
	private readonly _id: ModuleIdentifier;

	/**
	 * The name of the module.
	 * @description It is filename of the module in the most of the cases.
	 */
	public readonly name: string;

	/**
	 * The path of the module.
	 */
	public readonly path: string;

	/**
	 * Module identifier.
	 */
	get id(): ModuleIdentifier
	{
		return this._id;
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: ModuleMetadata)
	{
		this._id = initializer.id;
		this.name = initializer.name;
		this.path = initializer.path;
		this._children = initializer.children || [];
		this._types = initializer.types || [];
	}

	/**
	 * Returns array of modules required by this Module.
	 * @description These are all the imported modules.
	 */
	getChildren(): Module[]
	{
		return this._children.slice();
	}

	/**
	 * Returns array of types from the module.
	 */
	getTypes(): Type[]
	{
		return this._types.slice();
	}
}