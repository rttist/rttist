import { ModuleMetadata } from "./declarations";
import type { ModuleIdentifier, ModuleReference, TypeIdentifier, TypeReference } from "./declarations";
import { ModuleIds } from "@rttist/core";
import { resolveSingletonInstance } from "./helpers";
import { Module } from "./Module";
import { NativeTypes, Type } from "./Type";

export class MetadataLibrary {
	private readonly modules = new Map<ModuleIdentifier, Module>();
	private readonly types = new Map<TypeIdentifier, Type>();

	/**
	 * Map of aliases - mapping type identifiers to type identifiers.
	 * Aliases here means different identifier for the same type because of reexports; it's not TS aliases.
	 */
	private readonly aliases = new Map<TypeIdentifier, TypeIdentifier>();

	addMetadata(moduleMetadata: ModuleMetadata, stripInternals: boolean) {
		// TODO: Implement stripping of internals
		this.addModule(new Module(moduleMetadata));
	}

	/**
	 * Add Module with its Types to the Metadata.
	 * @param modules
	 */
	addModule(...modules: Module[]): void {
		for (let module of modules) {
			// noinspection SuspiciousTypeOfGuard
			if (!(module instanceof Module)) {
				throw new Error("Given module is not an instance of the Module class.");
			}

			if (module.id !== ModuleIds.Native && module.id !== ModuleIds.Invalid && this.modules.has(module.id)) {
				throw new Error(`Module with id '${module.id}' already exists.`);
			} else {
				this.modules.set(module.id, module);
			}

			// Add types from the module
			this.addType(...module.getTypes());
		}
	}

	/**
	 * Add Types to the Metadata.
	 * @param types
	 */
	addType(...types: Type[]): void {
		for (let type of types) {
			// noinspection SuspiciousTypeOfGuard
			if (!(type instanceof Type)) {
				throw new Error("Given type is not an instance of the Type class.");
			}

			if (!type.id) {
				throw new Error("Given type has invalid id.");
			}

			if (this.types.has(type.id)) {
				if (type.id.slice(0, ModuleIds.Native.length) === ModuleIds.Native) {
					continue;
				}

				throw new Error(`Type with id '${type.id}' already exists.`);
			}

			this.types.set(type.id, type);
		}
	}

	addAliases(aliases: { [alias: TypeIdentifier]: TypeIdentifier }) {
		Object.entries(aliases).forEach(([alias, target]) => {
			this.aliases.set(alias, target);
		});

		// TODO: maybe we can resolve aliases here? Always store alias and final type; not alias to alias. But it will cost startup time.
	}

	/**
	 * Returns the first Type in the Metadata that satisfies the provided predicate.
	 * If no Types satisfy the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Type | undefined}
	 */
	findType(predicate: (type: Type) => boolean): Type | undefined {
		for (const [_, type] of this.types) {
			if (predicate(type)) {
				return type;
			}
		}

		return undefined;
	}

	/**
	 * Returns all the Types contained in the Metadata.
	 */
	getTypes(): Type[] {
		return Array.from(this.types.values());
	}

	/**
	 * Returns the first Module in the Metadata that satisfies the provided predicate.
	 * If no Modules satisfy the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Module | undefined}
	 */
	findModule(predicate: (module: Module) => boolean): Module | undefined {
		for (const [_, module] of this.modules) {
			if (predicate(module)) {
				return module;
			}
		}

		return undefined;
	}

	/**
	 * Returns all Modules contained in Metadata.
	 */
	getModules(): Module[] {
		return Array.from(this.modules.values());
	}

	/**
	 * Returns a Type instance identified by the reference. Returns Type.Unknown if no Type found.
	 * @param reference
	 */
	resolveType(reference: TypeReference): Type {
		if (!reference) {
			throw new Error("Invalid type reference.");
		}

		if (typeof reference === "object") {
			const nativeType: Type | undefined = NativeTypes[reference[0]];

			if (nativeType) {
				return nativeType;
			}

			console.error("Type referenced by", reference, "not found.");
			return Type.Invalid;
		}

		// TODO: Resolve aliases

		return this.types.get(reference) ?? Type.Invalid;
	}

	/**
	 * Returns a Module instance identified by the reference. Returns Module.Unknown if no Module found.
	 * @param reference
	 */
	resolveModule(reference: ModuleReference): Module {
		if (!reference) {
			throw new Error("Invalid module reference.");
		}

		return this.modules.get(reference) ?? Module.Invalid;
	}
}

// noinspection JSUnusedGlobalSymbols
export const Metadata = resolveSingletonInstance("rttist/Metadata", MetadataLibrary);
