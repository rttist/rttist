import type { AnyTypeMetadata, ModuleIdentifier, ModuleMetadata } from "./declarations";
import type { Type } from "./Type";
import type { MetadataLibrary } from "./Metadata";
import { TypeFactory } from "./factories";
import { ModuleImporter } from "./ModuleImporter";
import { ModuleIds } from "@rttist/core";
import { LazyModuleArray } from "./utils/LazyModuleArray";

export class Module {
	/**
	 * Module for all the native types.
	 */
	public static readonly Native: Module = new Module(
		{ id: ModuleIds.Native, name: "native", path: "typescript" },
		undefined!
	);

	/**
	 * Module for dynamic types without specific module.
	 */
	public static readonly Dynamic: Module = new Module(
		{ id: ModuleIds.Dynamic, name: "dynamic", path: "" },
		undefined!
	);

	/**
	 * Unknown module.
	 */
	public static readonly Invalid: Module = new Module(
		{ id: ModuleIds.Invalid, name: "invalid", path: "" },
		undefined!
	);

	/** @internal */
	private readonly _childrenRefs: LazyModuleArray;
	/** @internal */
	private readonly _types: readonly Type[];
	/** @internal */
	private readonly _id: ModuleIdentifier;
	/** @internal */
	private readonly _import: () => Promise<object | undefined>;

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
	get id(): ModuleIdentifier {
		return this._id;
	}

	/**
	 * @param initializer
	 * @param metadataLibrary
	 */
	constructor(initializer: ModuleMetadata, metadataLibrary: MetadataLibrary) {
		this._id = initializer.id;
		this._import = initializer.import ?? (() => ModuleImporter.import(initializer.id));
		this.name = initializer.name;
		this.path = initializer.path;
		this._childrenRefs = new LazyModuleArray(metadataLibrary, initializer.children || []);
		this._types = Object.freeze(
			(initializer.types || []).map((typeMetadata) => {
				(typeMetadata as any).module = initializer.id;
				return TypeFactory.create(typeMetadata as AnyTypeMetadata, metadataLibrary);
			})
		);
	}

	/**
	 * Returns array of modules required by this Module.
	 * @description These are all the imported modules.
	 */
	getChildren(): ReadonlyArray<Module> {
		return this._childrenRefs.modules;
	}

	/**
	 * Returns array of types from the module.
	 */
	getTypes(): ReadonlyArray<Type> {
		return this._types;
	}

	/**
	 * Imports module and returns exported object.
	 */
	import(): Promise<undefined | { [exportName: string]: any }> {
		return this._import();
	}
}
