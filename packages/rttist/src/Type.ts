import type { TypeIdentifier, TypeMetadata } from "./declarations";
import type { MetadataLibrary } from "./MetadataLibrary";
import { MetadataScope } from "./metadata-scope";
import {
	ArrayType,
	ClassType,
	ConditionalType,
	EnumType,
	ESSymbolType,
	FunctionType,
	GenericType,
	InterfaceType,
	IntersectionType,
	LiteralType,
	ObjectLikeTypeBase,
	ObjectType,
	TemplateType,
	TupleType,
	TypeAliasType,
	TypeParameterType,
	UnionType,
	UniqueSymbolType,
} from "./types";
import type { Module } from "./Module";
import { resolveFromFunctionCallsite } from "./functions/resolveFromFunctionCallsite";
import { LazyModule } from "./utils/LazyModule";
import { LazyType } from "./utils/LazyType";
import { LazyTypeArray } from "./utils/LazyTypeArray";
import { LiteralTypeKinds, PrimitiveTypeKinds, TypeKind } from "./enums";

/**
 * Object representing TypeScript type in memory
 */
export class Type {
	public declare static readonly Invalid: Type;
	public declare static readonly NonPrimitiveObject: Type;
	public declare static readonly Any: Type;
	public declare static readonly Unknown: Type;
	public declare static readonly Void: Type;
	public declare static readonly Never: Type;
	public declare static readonly Null: Type;
	public declare static readonly Undefined: Type;
	public declare static readonly String: Type;
	public declare static readonly Number: Type;
	public declare static readonly BigInt: Type;
	public declare static readonly Boolean: Type;
	public declare static readonly True: Type;
	public declare static readonly False: Type;
	public declare static readonly Date: Type;
	public declare static readonly Error: Type;
	public declare static readonly Symbol: Type;
	public declare static readonly UniqueSymbol: Type;
	public declare static readonly RegExp: Type;
	public declare static readonly Int8Array: Type;
	public declare static readonly Uint8Array: Type;
	public declare static readonly Uint8ClampedArray: Type;
	public declare static readonly Int16Array: Type;
	public declare static readonly Uint16Array: Type;
	public declare static readonly Int32Array: Type;
	public declare static readonly Uint32Array: Type;
	public declare static readonly Float32Array: Type;
	public declare static readonly Float64Array: Type;
	public declare static readonly BigInt64Array: Type;
	public declare static readonly BigUint64Array: Type;
	public declare static readonly ArrayDefinition: Type;
	public declare static readonly TupleDefinition: Type;
	public declare static readonly ReadonlyArrayDefinition: Type;
	public declare static readonly MapDefinition: Type;
	public declare static readonly WeakMapDefinition: Type;
	public declare static readonly SetDefinition: Type;
	public declare static readonly WeakSetDefinition: Type;
	public declare static readonly PromiseDefinition: Type;
	public declare static readonly GeneratorDefinition: Type;
	public declare static readonly AsyncGeneratorDefinition: Type;
	public declare static readonly IteratorDefinition: Type;
	public declare static readonly IterableDefinition: Type;
	public declare static readonly IterableIteratorDefinition: Type;
	public declare static readonly AsyncIteratorDefinition: Type;
	public declare static readonly AsyncIterableDefinition: Type;
	public declare static readonly AsyncIterableIteratorDefinition: Type;
	public declare static readonly ArrayBuffer: Type;
	public declare static readonly SharedArrayBuffer: Type;
	public declare static readonly Atomics: Type;
	public declare static readonly DataView: Type;
	public declare static readonly Type: Type;
	public declare static readonly Module: Type;

	/** @internal */
	protected readonly _id: TypeIdentifier;
	/** @internal */
	protected readonly _kind: TypeKind;
	/** @internal */
	protected readonly _name: string; //MemberName;
	/** @internal */
	protected readonly _exported: boolean;
	/** @internal */
	protected readonly _nullable: boolean;
	/** @internal */
	protected readonly _moduleRef: LazyModule;
	/** @internal */
	protected readonly _typeArgumentsRef: LazyTypeArray;
	/** @internal */
	protected readonly _definitionRef?: LazyType<GenericType<Type>>;
	/** @internal */
	protected readonly _isGenericTypeDefinition: boolean;
	/** @internal */
	protected readonly _isIterable: boolean = false;
	// protected readonly _hasIterator: boolean;

	/** @internal */
	private readonly metadataLibrary: MetadataLibrary = MetadataScope.current;

	/**
	 * Type identifier.
	 */
	get id(): TypeIdentifier {
		return this._id;
	}

	get displayName(): string {
		return `<${TypeKind[this._kind]} ${this._name} [${this._id}]>`;
	}

	/**
	 * Kind of the type.
	 */
	get kind(): TypeKind {
		return this._kind;
	}

	/**
	 * Module which declare type represented by the this Type instance.
	 */
	get module(): Module {
		return this._moduleRef.module;
	}

	/**
	 * Name of the type.
	 */
	get name(): string {
		//MemberName
		return this._name;
	}

	/**
	 * Type is exported from its Module.
	 */
	get exported(): boolean {
		return this._exported;
	}

	/**
	 * Type has iterator, is iterable.
	 */
	get iterable(): boolean {
		return this._isIterable;
	}

	/**
	 * Type is nullable so null and undefined are valid values for the type.
	 */
	get nullable(): boolean {
		return this._nullable;
	}

	/**
	 * Definition of the generic type.
	 * @internal Hidden in Type; Should be visible only by GenericTypeDefinition<>.
	 */
	get genericTypeDefinition(): GenericType<Type> | undefined {
		return this._isGenericTypeDefinition ? (this as GenericType<typeof this>) : this._definitionRef?.type;
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: TypeMetadata) {
		if (!initializer.module) {
			throw new Error("Type must have a module.");
		}

		this._id = initializer.id;
		this._kind = initializer.kind;
		this._name = initializer.name;
		this._exported = initializer.exported || false;
		this._moduleRef = new LazyModule(initializer.module);
		this._nullable = initializer.nullable || this.metadataLibrary.configuration.nullability || false;

		// Generics
		this._definitionRef = initializer.genericTypeDefinition
			? new LazyType<GenericType<Type>>(initializer.genericTypeDefinition)
			: undefined;
		this._isGenericTypeDefinition = initializer.isGenericTypeDefinition || false;
		this._typeArgumentsRef = new LazyTypeArray(initializer.typeArguments || []);
	}

	[Symbol.for("nodejs.util.inspect.custom")]() {
		return this.toString();
	}

	/**
	 * Returns true if type is equal to type passed as type argument.
	 */
	is<T>(): boolean;
	/**
	 * Returns true if types are equal.
	 * @param target
	 */
	is<TType extends Type>(target: TType): target is TType;
	is<T>(target?: Type): boolean {
		if (target === undefined) {
			const [targetTypeReference] = resolveFromFunctionCallsite(this.is);
			target = this.metadataLibrary.resolveType(targetTypeReference);
		}

		return this._id === target._id;
	}

	/**
	 * Returns array of generic type arguments.
	 * @internal Exposed by {@link GenericType}.
	 */
	getTypeArguments(): ReadonlyArray<Type> {
		return this._typeArgumentsRef.types;
	}

	//////////////////////////////////////////////////////////////////// GUARDS /////////////////////////////////////////////////////////////////

	/**
	 * Check whether the type is generic.
	 */
	isGenericType(): this is GenericType<typeof this> {
		return this._typeArgumentsRef.length > 0;
	}

	/**
	 * Check whether the type is definition of the generic type.
	 */
	isGenericTypeDefinition(): this is GenericType<typeof this> {
		return this._isGenericTypeDefinition;
	}

	/**
	 * Check whether the type is generic type parameter.
	 */
	isTypeParameter(): this is TypeParameterType {
		return this._kind === TypeKind.TypeParameter;
	}

	/**
	 * Returns a value indicating whether the Type is container for unified Types or not.
	 */
	isUnion(): this is UnionType {
		return this._kind === TypeKind.Union;
	}

	/**
	 * Returns a value indicating whether the Type is container for intersecting Types or not.
	 */
	isIntersection(): this is IntersectionType {
		return this._kind === TypeKind.Intersection;
	}

	/**
	 * Returns a value indicating whether the Type is a class or not.
	 */
	isClass(): this is ClassType {
		return this._kind === TypeKind.Class;
	}

	/**
	 * Returns a value indicating whether the Type is a interface or not.
	 */
	isInterface(): this is InterfaceType {
		return this._kind === TypeKind.Interface;
	}

	/**
	 * Returns a value indicating whether the Type is a interface or not.
	 */
	isTypeAlias(): this is TypeAliasType {
		return this._kind === TypeKind.Alias;
	}

	/**
	 * Returns a value indicating whether the Type is an literal or not.
	 */
	isLiteral(): this is LiteralType {
		return LiteralTypeKinds.has(this._kind);
	}

	/**
	 * Returns true if type is union or intersection of types
	 */
	isUnionOrIntersection(): this is UnionType | IntersectionType {
		return this.isUnion() || this.isIntersection();
	}

	/**
	 * Check if this type is an Array.
	 */
	isArray(): this is ArrayType {
		return (
			this.isGenericType() &&
			(this.genericTypeDefinition === Type.ArrayDefinition ||
				this.genericTypeDefinition === Type.ReadonlyArrayDefinition)
		);
	}

	/**
	 * Check if this type is a Tuple.
	 */
	isTuple(): this is TupleType {
		return (
			this.isGenericType() &&
			this.genericTypeDefinition === Type.TupleDefinition
		);
	}

	/**
	 * Determines whether the object represented by the current Type is an Enum.
	 * @return {boolean}
	 */
	isEnum(): this is EnumType {
		return this._kind === TypeKind.Enum;
	}

	/**
	 * Determines whether the object represented by the current Type is an Conditional type.
	 * @return {boolean}
	 */
	isConditional(): this is ConditionalType {
		return this._kind === TypeKind.ConditionalType;
	}

	/**
	 * Determines whether the object represented by the current Type is an object-like type.
	 */
	isObjectLike(): this is ObjectLikeTypeBase {
		return this.isObject() || this.isClass() || this.isInterface();
	}

	/**
	 * Determines whether the object represented by the current Type is an Object type.
	 */
	isObject(): this is ObjectType {
		return this._kind === TypeKind.Object;
	}

	/**
	 * Determines whether the object represented by the current Type is an Template type.
	 */
	isTemplate(): this is TemplateType {
		// TODO: TemplateLiteral vs Template expression
		return this._kind === TypeKind.TemplateLiteral;
	}

	/**
	 * Determines whether the object represented by the current Type is a Function type.
	 */
	isFunction(): this is FunctionType {
		return this._kind === TypeKind.Function;
	}

	/**
	 * Determines whether the object represented by the current Type is one of the predefined ES symbols.
	 */
	isESSymbol(): this is ESSymbolType {
		return this._kind === TypeKind.ESSymbol;
	}

	/**
	 * Determines whether the object represented by the current Type is an unique symbol.
	 */
	isUniqueSymbol(): this is UniqueSymbolType {
		return this._kind === TypeKind.UniqueSymbol;
	}

	//////////////////////////////////////////////////////////////////// CHECKS /////////////////////////////////////////////////////////////////

	/**
	 * Returns true whether current Type is instantiable.
	 */
	isInstantiable(): boolean {
		return this.isClass() || this.isFunction(); // TODO: Array, Date etc...
	}

	/**
	 * Check if this is a primitive type ("string", "number", "boolean" etc.).
	 */
	isPrimitive(): boolean {
		return PrimitiveTypeKinds.has(this._kind);
	}

	// TODO: Remove this. This means many functions like isPromise(), isArray() etc.
	//  Those are generic types so there should be something like .is(getType<Promise<any>>).
	//  C# allows to write SomeGenericType<,> without specifying generic parameters.
	//  We can use "any" but it will be strange for types with many generic parameters. .is(getType<SomeGenericType<any, any, any, any, any>)

	/**
	 * Check if this type is a string.
	 */
	isString(): boolean {
		return (
			this._kind === TypeKind.String ||
			this._kind === TypeKind.StringLiteral ||
			this._kind === TypeKind.TemplateLiteral
		);
	}

	/**
	 * Check if this type is a number.
	 */
	isNumber(): boolean {
		return this._kind === TypeKind.Number || this._kind === TypeKind.NumberLiteral;
	}

	/**
	 * Check if this type is a bigint.
	 */
	isBigInt(): boolean {
		return this._kind === TypeKind.BigInt || this._kind === TypeKind.BigIntLiteral;
	}

	/**
	 * Check if this type is a boolean.
	 */
	isBoolean(): boolean {
		return this._kind === TypeKind.Boolean || this._kind === TypeKind.True || this._kind === TypeKind.False;
	}

	/**
	 * Check if this type is an "any".
	 */
	isAny(): boolean {
		return this._kind === TypeKind.Any;
	}

	/**
	 * Check if this type is an "never".
	 */
	isNever(): boolean {
		return this._kind === TypeKind.Never;
	}

	/**
	 * Check if this type is an "void".
	 */
	isVoid(): boolean {
		return this._kind === TypeKind.Void;
	}

	/**
	 * Check if this type is an "undefined".
	 */
	isUndefined(): boolean {
		return this._kind === TypeKind.Undefined;
	}

	/**
	 * Check if this type is an "null".
	 */
	isNull(): boolean {
		return this._kind === TypeKind.Null;
	}

	/**
	 * Returns string representation of the type.
	 * @returns {string} Returns string in format "Kind{fullName}"
	 */
	toString(): string {
		const props = this.getPropsToStringify();

		return (
			`${this.displayName} {\n` +
			"    ```typeinfo\n" +
			`    typelib: ${this.metadataLibrary.name}\n    module:  ${this.module.id}\n` +
			"    ```" +
			(props.length ? "\n" : "") +
			this.stringifyProps(props, 1) +
			"\n}"
		);
	}

	/**
	 * Returns string representation of the type's properties.
	 * @protected
	 */
	protected getPropsToStringify(): PropsToStringify {
		return [];
	}

	private stringifyProps(props: PropsToStringify, indent: number): string {
		const indentation = "    ".repeat(indent);
		return props
			.map((prop) => {
				const str = prop instanceof Array ? this.stringifyProps(prop, 1) : prop;
				return str.replace(/^/gm, indentation);
			})
			.join("\n");
	}
}

export type PropsToStringify = string[] | PropsToStringify[];
