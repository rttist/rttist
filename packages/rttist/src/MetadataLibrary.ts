import type {
	ModuleIdentifier,
	ModuleMetadata,
	ModuleReference,
	TypeIdentifier,
	TypeReference,
	TypesConfiguration,
} from "./declarations";
import { ModuleIds } from "@rttist/core";
import { Module } from "./Module";
import { Type } from "./Type";
import { MetadataScope } from "./metadata-scope";
import {
	ArrayType,
	IntersectionType,
	LiteralType,
	MapType,
	PromiseType,
	ReadonlyArrayType,
	SetType,
	TupleType,
	UnionType,
	WeakMapType,
	WeakSetType,
} from "./types";
import { TypeKind } from "./enums";

const TYPE_IDENTIFIER_REGEX = /^([#@][^,|&]+?)\{(.+?)}(\?)?$/;
const NATIVE_KNOWN_TYPES_CTOR_MAP = new Map<string, new (...args: any[]) => Type>([
	["#Promise", PromiseType],
	["#Array", ArrayType],
	["#ReadonlyArray", ReadonlyArrayType],
	["#Set", SetType],
	["#WeakSet", WeakSetType],
	["#Map", MapType],
	["#WeakMap", WeakMapType],
	["#Tuple", TupleType],
]);

export class MetadataLibrary {
	private readonly modules = new Map<ModuleIdentifier, Module>();
	private readonly types = new Map<TypeIdentifier, Type>();
	private readonly isGlobalMetadataLibrary: boolean;

	/**
	 * Map of aliases - mapping type identifiers to type identifiers.
	 * Aliases here means different identifier for the same type because of reexports; it's not TS aliases.
	 */
	private readonly aliases = new Map<TypeIdentifier, TypeIdentifier>();

	constructor(configuration: TypesConfiguration, name: string, parentLibrary: MetadataLibrary);
	/** @internal */
	constructor(configuration: TypesConfiguration, name: string);
	constructor(
		public readonly configuration: TypesConfiguration,
		public readonly name: string,
		private readonly parentLibrary?: MetadataLibrary
	) {
		if (!parentLibrary && new.target !== GlobalMetadataLibrary) {
			throw new Error("Cannot instantiate new MetadataLibrary without parent.");
		}

		this.isGlobalMetadataLibrary = new.target === GlobalMetadataLibrary;
	}

	toString() {
		return (
			`${this.name}` +
			` (${this.modules.size} modules, ${this.types.size} types)` +
			` ${JSON.stringify(this.configuration, undefined, 4)}`
		);
	}

	[Symbol.for("nodejs.util.inspect.custom")]() {
		return this.toString();
	}

	/**
	 * Returns the first Type from the library that satisfies the provided predicate.
	 * If no Type satisfies the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Type | undefined}
	 */
	findType(predicate: (type: Type) => boolean): Type | undefined {
		for (const [_, type] of this.types) {
			if (predicate(type)) {
				return type;
			}
		}

		if (this.parentLibrary !== undefined) {
			return this.parentLibrary.findType(predicate);
		}

		return undefined;
	}

	/**
	 * Returns all the Types contained in the Metadata.
	 */
	getTypes(): Type[] {
		return Array.from(this.types.values()).concat(this.parentLibrary?.getTypes() ?? []);
	}

	/**
	 * Returns the first Module from the library that satisfies the provided predicate.
	 * If no Module satisfies the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Module | undefined}
	 */
	findModule(predicate: (module: Module) => boolean): Module | undefined {
		for (const [_, module] of this.modules) {
			if (predicate(module)) {
				return module;
			}
		}

		if (this.parentLibrary !== undefined) {
			return this.parentLibrary.findModule(predicate);
		}

		return undefined;
	}

	/**
	 * Returns all Modules contained in the library.
	 */
	getModules(): Module[] {
		return Array.from(this.modules.values()).concat(this.parentLibrary?.getModules() ?? []);
	}

	/**
	 * Returns a Type instance identified by the reference. Returns Type.Invalid if no Type found.
	 * @param id
	 */
	resolveType(id: TypeReference): Type {
		if (!id) {
			throw new Error("Invalid type reference.");
		}

		const existingType = this.types.get(id) ?? this.parentLibrary?.types.get(id);

		if (existingType !== undefined) {
			return existingType;
		}

		// Ad-hoc types
		const adhocType = this.handleAdhocType(id);

		if (adhocType) {
			return adhocType;
		}

		return Type.Invalid;
	}

	/**
	 * Returns a Module instance identified by the reference. Returns Module.Invalid if no Module found.
	 * @param id
	 */
	resolveModule(id: ModuleReference): Module {
		if (!id) {
			throw new Error("Invalid module reference.");
		}

		return this.modules.get(id) ?? this.parentLibrary?.modules.get(id) ?? Module.Invalid;
	}

	addMetadata(moduleMetadata: ModuleMetadata, stripInternals: boolean) {
		// TODO: Implement stripping of internals
		// if (stripInternals) {
		//
		// 	return;
		// }

		if (this.parentLibrary) {
			this.parentLibrary.addMetadata(moduleMetadata, stripInternals);
			return;
		}

		MetadataScope.doWithScope(this, () => {
			const module = new Module(moduleMetadata);
			this.addModule(module);
		});
	}

	/**
	 * Add Module with its Types to the Metadata.
	 * @param modules
	 */
	addModule(...modules: Module[]): void {
		// TODO: Handle parentLibrary properly; keep internals here and strip them for parent
		if (this.parentLibrary) {
			this.parentLibrary.addModule(...modules);
			return;
		}

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
		// TODO: Handle parentLibrary properly; keep internals here and strip them for parent
		if (this.parentLibrary) {
			this.parentLibrary.addType(...types);
			return;
		}

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

				// TODO: Uncomment throw after fixing duplicities in metadata
				// throw new Error(`Type with id '${type.id}' already exists.`);
				return;
			}

			this.types.set(type.id, type);
		}
	}

	addAliases(aliases: { [alias: TypeIdentifier]: TypeIdentifier }) {
		if (this.parentLibrary) {
			this.parentLibrary.addAliases(aliases);
			return;
		}

		Object.entries(aliases).forEach(([alias, target]) => {
			this.aliases.set(alias, target);
		});

		// TODO: maybe we can resolve aliases here? Always store alias and final type; not alias to alias. But it will cost startup time.
	}

	private createLiteralType(id: string) {
		const value = id.slice(3, -1);
		const kind =
			value[value.length - 1] === "n"
				? TypeKind.BigIntLiteral
				: value[0] === "'"
				? TypeKind.StringLiteral
				: value === "true"
				? TypeKind.True
				: value === "false"
				? TypeKind.False
				: value[0] === "/"
				? TypeKind.RegExpLiteral
				: TypeKind.NumberLiteral;

		return new LiteralType({
			id: id,
			value: kind === TypeKind.StringLiteral ? value.slice(1, -1) : value,
			kind: kind,
			module: ModuleIds.Native,
			name: value,
		});
	}

	private getTypeIdInfo(id: TypeReference) {
		const match = id.match(TYPE_IDENTIFIER_REGEX);

		if (!match) {
			return;
		}

		return {
			type: match[1],
			arguments: match[2].split(","),
			nullable: match[3] === "?",
		};
	}

	private handleAdhocType(id: TypeReference) {
		if (id.slice(0, 3) == "#L(") {
			const type = this.createLiteralType(id);
			this.addType(type);
			return type;
		}

		const typeIdInfo = this.getTypeIdInfo(id);

		if (!typeIdInfo) {
			return;
		}

		// UNION or INTERSECTION
		if (typeIdInfo.type === "#|" || typeIdInfo.type === "#&") {
			const type = new (typeIdInfo.type === "#|" ? UnionType : IntersectionType)({
				id: id,
				module: ModuleIds.Native,
				name: typeIdInfo.type,
				kind: TypeKind.Union,
				types: typeIdInfo.arguments,
				nullable: typeIdInfo.nullable,
			});
			this.addType(type);
			return type;
		}

		// NATIVE GENERIC TYPEs
		const Ctor = NATIVE_KNOWN_TYPES_CTOR_MAP.get(typeIdInfo.type);

		if (Ctor) {
			const type = new Ctor({
				id: id,
				module: ModuleIds.Native,
				name: `${typeIdInfo.type.slice(1)}<'${typeIdInfo.arguments.length}>`,
				kind: TypeKind.Type,
				typeArguments: typeIdInfo.arguments.map((typeId) => typeId),
			});
			this.addType(type);
			return type;
		}

		if (typeIdInfo.type[0] === "@") {
			const type = new Type({
				id: id,
				module: ModuleIds.Native,
				name: `${typeIdInfo.type.slice(1)}<'${typeIdInfo.arguments.length}>`,
				kind: TypeKind.Type,
				typeArguments: typeIdInfo.arguments.map((typeId) => typeId),
				genericTypeDefinition: typeIdInfo.type,
			});
			this.addType(type);
			return type;
		}
	}
}

export class GlobalMetadataLibrary extends MetadataLibrary {
	constructor(configuration: TypesConfiguration) {
		super(configuration, "Global metadata library");
	}
}
