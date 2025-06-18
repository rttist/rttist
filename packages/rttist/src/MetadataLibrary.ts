import type {
	ModuleIdentifier,
	ModuleMetadata,
	ModuleReference,
	TypeIdentifier,
	TypeReference,
	TypesConfiguration,
} from "./declarations";
import { getCallsiteTypeArguments, ModuleIds, PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
import { GenericTypeRegister } from "./GenericTypeRegister";
import { getTypeOfRuntimeValue } from "./helpers";
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
import { getGlobalThis } from "./utils/getGlobalThis";
import { instanceOfModule, instanceOfType } from "./utils/instanceOf";

const ERROR_DISABLE_PROPERTY_NAME = "reflect-gettype-error-disable";
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

export interface MetadataLibrary {
	readonly configuration: TypesConfiguration;
	readonly name: string;

	toString(): string;

	/**
	 * Returns the first Type from the library that satisfies the provided predicate.
	 * If no Type satisfies the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Type | undefined}
	 */
	findType(predicate: (type: Type) => boolean): Type | undefined;

	/**
	 * Returns all the Types contained in the Metadata.
	 */
	getTypes(): Type[];

	/**
	 * Returns the first Module from the library that satisfies the provided predicate.
	 * If no Module satisfies the predicate, undefined is returned.
	 * @param predicate
	 * @returns {Module | undefined}
	 */
	findModule(predicate: (module: Module) => boolean): Module | undefined;

	/**
	 * Returns all Modules contained in the library.
	 */
	getModules(): Module[];

	/**
	 * Returns a Type instance identified by the reference. Returns Type.Invalid if no Type found.
	 * @param id
	 */
	resolveType(id: TypeReference): Type;

	/**
	 * Returns a Module instance identified by the reference. Returns Module.Invalid if no Module found.
	 * @param id
	 */
	resolveModule(id: ModuleReference): Module;

	/**
	 * Cast type to expandable library allowing you to modify the library.
	 */
	asExpandable(): ExpandableMetadataLibrary;

	/**
	 * Returns Type object for passed generic type parameter or function parameter.
	 * @param [args] Optional parameter for cases when you want to get Type object from runtime value.
	 * Always use generic type parameter if you can statically access the type.
	 * Use this runtime function argument only if you have no other option.
	 * It is reliable only for classes, functions and primitives (such as undefined, true, false, numbers, strings).
	 * @example
	 * getType<MyInterface>() // returns Type object for `MyInterface` interface.
	 * getType<MyClass>() // returns Type object for `MyClass` class.
	 * getType(someClassCtor) // returns Type object corresponding to class stored in `someClassCtor` variable.
	 * getType(someClassInstance) // returns Type object corresponding to class of instance stored in `someClassInstance` variable.
	 */
	getType<T>(...args: any[]): Type;

	/**
	 * Returns a generic class for the given class constructor and type parameters.
	 * @param classCtor
	 * @param typeParameters
	 * @remarks This method is used to create a generic class with the given type parameters.
	 * Created generic classes are cached and stored in the metadata library after creation.
	 * Created generic class inherits from the original class constructor.
	 */
	getGenericClass<T>(classCtor: { new (...args: any[]): T }, ...typeParameters: Type[]): Function;

	/**
	 * The static Reflect.construct() method acts like the new operator, but as a function.
	 * It is equivalent to calling new target(...args).
	 * It gives also the added option to specify a different prototype.
	 * @param target The target function to call.
	 * @param typeParameters An array specifying the type arguments.
	 * @param argumentsList An array-like object specifying the arguments with which target should be called.
	 * @param newTarget The constructor whose prototype should be used.
	 * See also the new.target operator. If newTarget is not present, its value defaults to target.
	 * @returns A new instance of target (or newTarget, if present),
	 * initialized by target as a constructor with the given argumentsList.
	 */
	constructGeneric<TType = any>(
		target: Function,
		typeParameters: Array<Type | TypeReference>,
		argumentsList: ArrayLike<any>,
		newTarget?: Function
	): TType;
}

export type ExpandableMetadataLibrary = Omit<MetadataLibrary, "asExpandable"> & {
	/**
	 * Add complex Metadata for a module.
	 * @param moduleMetadata
	 * @param stripInternals
	 */
	addMetadata(moduleMetadata: ModuleMetadata, stripInternals: boolean): void;

	/**
	 * Clear all metadata.
	 * @param packageName Name of the package to clear metadata for.
	 */
	clearMetadata(packageName: string): void;

	/**
	 * Add Module with its Types to the Metadata.
	 * @param modules
	 */
	addModule(...modules: Module[]): void;

	/**
	 * Add Types to the Metadata.
	 * @param types
	 */
	addType(...types: Type[]): void;

	/**
	 * Add an alias for type
	 * @param aliases
	 */
	addAliases(aliases: { [alias: TypeIdentifier]: TypeIdentifier }): void;
};

export type IMetadataLibrary = MetadataLibrary & ExpandableMetadataLibrary;

export class BaseMetadataLibrary implements IMetadataLibrary {
	private readonly modules = new Map<ModuleIdentifier, Module>();
	private readonly types = new Map<TypeIdentifier, Type>();
	private readonly isGlobalMetadataLibrary: boolean;
	private readonly genericTypeRegister = new GenericTypeRegister(this);

	/**
	 * Map of aliases - mapping type identifiers to type identifiers.
	 * Aliases here means different identifier for the same type because of reexports; it's not TS aliases.
	 */
	private readonly aliases = new Map<TypeIdentifier, TypeIdentifier>();

	constructor(configuration: TypesConfiguration, name: string, parentLibrary: BaseMetadataLibrary);
	/** @internal */
	constructor(configuration: TypesConfiguration, name: string);
	constructor(
		public readonly configuration: TypesConfiguration,
		public readonly name: string,
		private readonly parentLibrary?: BaseMetadataLibrary
	) {
		if (!parentLibrary && new.target !== GlobalMetadataLibrary) {
			throw new Error("Cannot instantiate new MetadataLibrary without parent.");
		}

		this.isGlobalMetadataLibrary = new.target === GlobalMetadataLibrary;

		this.getType = this.getType.bind(this);
		this.resolveType = this.resolveType.bind(this);
		this.getGenericClass = this.getGenericClass.bind(this);
		this.constructGeneric = this.constructGeneric.bind(this);
	}

	/**
	 * @inheritDoc
	 */
	asExpandable(): ExpandableMetadataLibrary {
		return this;
	}

	/**
	 * @inheritDoc
	 */
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
	 * @inheritDoc
	 */
	getGenericClass<T>(classCtor: { new (...args: any[]): T }, ...typeParameters: Type[]): Function {
		if (typeParameters.length === 0) {
			const callsiteArgs = getCallsiteTypeArguments(this.getGenericClass);

			if (callsiteArgs?.[0] !== undefined) {
				const type = this.resolveType(callsiteArgs[0]);

				return this.genericTypeRegister.getGenericClass(
					classCtor,
					type.isGenericType() ? type.getTypeArguments() : []
				);
			}
		}

		return this.genericTypeRegister.getGenericClass(classCtor, typeParameters);
	}

	/**
	 * @inheritDoc
	 */
	constructGeneric<TType = any>(
		target: Function,
		typeParameters: Array<Type | TypeReference>,
		argumentsList: ArrayLike<any>,
		newTarget?: Function
	): TType {
		const Class = this.getGenericClass(
			target as { new (...args: any[]): unknown },
			...typeParameters.map((tpReference) =>
				instanceOfType(tpReference) ? tpReference : this.resolveType(tpReference)
			)
		);

		if (newTarget !== undefined) {
			newTarget = this.inheritNewTarget(newTarget, Class);
		}

		return Reflect.construct(Class, argumentsList, newTarget ?? Class);
	}

	private inheritNewTarget(newTarget: Function, Class: Function) {
		const name = newTarget.name !== undefined ? `${newTarget.name}{}` : Class.name;

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const inheritedNewTarget = {
			[name]: class {},
		}[name]!;

		Object.setPrototypeOf(inheritedNewTarget.prototype, newTarget.prototype);

		(inheritedNewTarget.prototype as any)[PROTOTYPE_TYPE_PROPERTY] = Class.prototype[PROTOTYPE_TYPE_PROPERTY];

		return inheritedNewTarget;
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

	clearMetadata(packageName: string) {
		const packagePrefix = `${packageName}/`;

		for (const typeId of this.types.keys()) {
			if (typeId.startsWith(packagePrefix)) {
				this.types.delete(typeId);
				this.parentLibrary?.types.delete(typeId);
			}
		}

		for (const moduleId of this.modules.keys()) {
			if (moduleId.startsWith(packagePrefix)) {
				this.modules.delete(moduleId);
				this.parentLibrary?.modules.delete(moduleId);
			}
		}
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

		for (const module of modules) {
			// noinspection SuspiciousTypeOfGuard
			if (!instanceOfModule(module)) {
				throw new Error("Given module is not an instance of the Module class.");
			}

			if (module.id !== ModuleIds.Native && module.id !== ModuleIds.Invalid && this.modules.has(module.id)) {
				throw new Error(`Module with id '${module.id}' already exists.`);
			}

			this.modules.set(module.id, module);

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

		for (const type of types) {
			// noinspection SuspiciousTypeOfGuard
			if (!instanceOfType(type)) {
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

		for (const [alias, target] of Object.entries(aliases)) {
			this.aliases.set(alias, target);
		}

		// TODO: maybe we can resolve aliases here? Always store alias and final type; not alias to alias. But it will cost startup time.
	}

	getType<T>(...args: any[]): Type {
		if (args.length) {
			return getTypeOfRuntimeValue(args[0], this);
		}

		const callsiteArgs = getCallsiteTypeArguments(this.getType);

		if (callsiteArgs !== undefined) {
			if (callsiteArgs.length === 0 || callsiteArgs[0] === undefined) {
				return Type.Invalid;
			}

			return this.resolveType(callsiteArgs[0]);
		}

		const globalObject = getGlobalThis();

		if (!globalObject[ERROR_DISABLE_PROPERTY_NAME]) {
			console.debug(
				// biome-ignore lint/style/useTemplate: <explanation>
				"[ERR] RTTIST: You are calling `getType()` function directly. " +
					"More information at https://github.com/rttist/rttist/issues/17. " +
					"To suppress this message, create field '" +
					ERROR_DISABLE_PROPERTY_NAME +
					"' in global object (window | global | globalThis) eg. `window['" +
					ERROR_DISABLE_PROPERTY_NAME +
					"'] = true;`"
			);
		}

		// In case of direct call without argument nor callsite, we'll return Invalid type.
		return Type.Invalid;
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
			type: match[1]!,
			arguments: match[2]!.split(","),
			nullable: match[3] === "?",
		};
	}

	private handleAdhocType(id: TypeReference) {
		if (id.slice(0, 3) === "#L(") {
			const type = this.createLiteralType(id);
			this.addType(type);
			return type;
		}

		const typeIdInfo = this.getTypeIdInfo(id);

		if (!typeIdInfo) {
			return undefined;
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

		return undefined;
	}
}

export class GlobalMetadataLibrary extends BaseMetadataLibrary {
	constructor(configuration: TypesConfiguration) {
		super(configuration, "Global metadata library");
	}
}
