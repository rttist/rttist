// noinspection JSUnusedGlobalSymbols

import type {
	TypeIdentifier,
	TypeMetadata,
	TypesConfiguration,
}                        from "./declarations";
import type {
	ClassType,
	ConditionalType,
	EnumType,
	FunctionType,
	GenericType,
	InterfaceType,
	IntersectionType,
	LiteralType,
	ObjectLikeTypeBase,
	ObjectType,
	TemplateType,
	TypeParameterType,
	UnionType
}                        from "./types";
import type { Module }   from "./Module";
import { ModuleIds }     from "@rttist/core";
import { TypeAliasType } from "./types/TypeAliasType";
import { LazyModule }    from "./utils/LazyModule";
import { LazyType }      from "./utils/LazyType";
import { LazyTypeArray } from "./utils/LazyTypeArray";
import {
	LiteralTypeKinds,
	PrimitiveTypeKinds,
	TypeKind
}                        from "./enums";

const createdNativeTypes = new Set();

/**
 * Create native type from object.
 */
function cn(name: string, kind: TypeKind): Type
{
	const type = new Type({
		kind,
		name,
		id: ModuleIds.Native + name,
		module: ModuleIds.Native
	});

	createdNativeTypes.add(type);

	return type;
}

/**
 * Object representing TypeScript type in memory
 */
export class Type
{
	public static readonly Invalid: Type = cn("Invalid", TypeKind.Invalid);
	public static readonly NonPrimitiveObject: Type = cn("object", TypeKind.NonPrimitiveObject);
	public static readonly Any: Type = cn("any", TypeKind.Any);
	public static readonly Unknown: Type = cn("unknown", TypeKind.Unknown);
	public static readonly Void: Type = cn("void", TypeKind.Void);
	public static readonly Never: Type = cn("never", TypeKind.Never);
	public static readonly Null: Type = cn("null", TypeKind.Null);
	public static readonly Undefined: Type = cn("undefined", TypeKind.Undefined);
	public static readonly String: Type = cn("String", TypeKind.String);
	public static readonly Number: Type = cn("Number", TypeKind.Number);
	public static readonly BigInt: Type = cn("BigInt", TypeKind.BigInt);
	public static readonly Boolean: Type = cn("Boolean", TypeKind.Boolean);
	public static readonly True: Type = cn("true", TypeKind.True);
	public static readonly False: Type = cn("false", TypeKind.False);
	public static readonly Date: Type = cn("Date", TypeKind.Date);
	public static readonly Symbol: Type = cn("Symbol", TypeKind.Symbol);
	public static readonly UniqueSymbol: Type = cn("UniqueSymbol", TypeKind.UniqueSymbol);
	public static readonly RegExp: Type = cn("RegExp", TypeKind.RegExp);
	public static readonly Int8Array: Type = cn("Int8Array", TypeKind.Int8Array);
	public static readonly Uint8Array: Type = cn("Uint8Array", TypeKind.Uint8Array);
	public static readonly Uint8ClampedArray: Type = cn("Uint8ClampedArray", TypeKind.Uint8ClampedArray);
	public static readonly Int16Array: Type = cn("Int16Array", TypeKind.Int16Array);
	public static readonly Uint16Array: Type = cn("Uint16Array", TypeKind.Uint16Array);
	public static readonly Int32Array: Type = cn("Int32Array", TypeKind.Int32Array);
	public static readonly Uint32Array: Type = cn("Uint32Array", TypeKind.Uint32Array);
	public static readonly Float32Array: Type = cn("Float32Array", TypeKind.Float32Array);
	public static readonly Float64Array: Type = cn("Float64Array", TypeKind.Float64Array);
	public static readonly BigInt64Array: Type = cn("BigInt64Array", TypeKind.BigInt64Array);
	public static readonly BigUint64Array: Type = cn("BigUint64Array", TypeKind.BigUint64Array);

	/**
	 * Configuration - global nullability of all the types (StrictNullChecks TS option).
	 * @internal
	 */
	private static _nullability: boolean;

	/** @internal */
	protected readonly _id: TypeIdentifier;
	/** @internal */
	protected readonly _kind: TypeKind;
	/** @internal */
	protected readonly _name: string;
	/** @internal */
	protected readonly _exported: boolean;
	/** @internal */
	protected readonly _nullable?: boolean;
	/** @internal */
	protected readonly _moduleRef: LazyModule;
	/** @internal */
	protected readonly _typeArgumentsRef: LazyTypeArray;
	/** @internal */
	protected readonly _definitionRef?: LazyType<GenericType<Type>>;
	/** @internal */
	protected readonly _isGenericTypeDefinition: boolean;

	/**
	 * Type identifier.
	 */
	get id(): TypeIdentifier
	{
		return this._id;
	}

	/**
	 * Kind of the type.
	 */
	get kind(): TypeKind
	{
		return this._kind;
	}

	/**
	 * Module which declare type represented by the this Type instance.
	 */
	get module(): Module
	{
		return this._moduleRef.module;
	}

	/**
	 * Name of the type.
	 */
	get name(): string
	{
		return this._name;
	}

	/**
	 * Type is exported from its Module.
	 */
	get exported(): boolean
	{
		return this._exported;
	}

	/**
	 * Type is nullable so null and undefined are valid values for the type.
	 */
	get nullable(): boolean
	{
		return this._nullable || Type._nullability;
	}

	/**
	 * Definition of the generic type.
	 * @internal Hidden in Type; Should be visible only by GenericTypeDefinition<>.
	 */
	get genericTypeDefinition(): GenericType<Type> | undefined
	{
		return this._isGenericTypeDefinition
			? this as GenericType<typeof this>
			: this._definitionRef?.type;
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: TypeMetadata)
	{
		if (createdNativeTypes.has(initializer.kind))
		{
			throw new Error("Cannot create native type multiple times.");
		}

		this._id = initializer.id;// ?? Symbol();
		this._kind = initializer.kind;
		this._name = initializer.name;
		// this._fullName = initializer.fullName || "";
		this._exported = initializer.exported || false;

		// Set to _nullable only when defined in initializer. If not specified, it must be lazily taken from TypesConfiguration.
		if (initializer.nullable === true)
		{
			this._nullable = true;
		}

		this._moduleRef = new LazyModule(initializer.module);

		// Generics
		this._definitionRef = initializer.genericTypeDefinition
			? new LazyType<GenericType<Type>>(initializer.genericTypeDefinition)
			: undefined;
		this._isGenericTypeDefinition = initializer.isGenericTypeDefinition || false;
		this._typeArgumentsRef = new LazyTypeArray(initializer.typeArguments || []);
	}

	/**
	 * Configure behavior of types.
	 * @param nullability
	 */
	static configure({ nullability }: TypesConfiguration)
	{
		this._nullability = nullability ?? false;
	}

	/**
	 * @private
	 */
	private isComparableByKind(): boolean
	{
		return !!NativeTypes[this._kind];
	}

	/**
	 * Returns true if types are equal.
	 * @param target
	 */
	is(target: Type)
	{
		if (this.isComparableByKind())
		{
			return this._kind === target._kind;
		}

		return this._id === target._id;
	}

	/**
	 * Returns array of generic type arguments.
	 * @internal Exposed by {@link GenericType}.
	 */
	getTypeArguments(): ReadonlyArray<Type>
	{
		return this._typeArgumentsRef.types;
	}

	//////////////////////////////////////////////////////////////////// GUARDS /////////////////////////////////////////////////////////////////

	/**
	 * Check whether the type is generic.
	 */
	isGenericType(): this is GenericType<typeof this>
	{
		return this._typeArgumentsRef.length > 0;
	}

	/**
	 * Check whether the type is definition of the generic type.
	 */
	isGenericTypeDefinition(): this is GenericType<typeof this>
	{
		return this._isGenericTypeDefinition;
	}

	/**
	 * Check whether the type is generic type parameter.
	 */
	isTypeParameter(): this is TypeParameterType
	{
		return this._kind === TypeKind.TypeParameter;
	}

	/**
	 * Returns a value indicating whether the Type is container for unified Types or not.
	 */
	isUnion(): this is UnionType
	{
		return this._kind === TypeKind.Union;
	}

	/**
	 * Returns a value indicating whether the Type is container for intersecting Types or not.
	 */
	isIntersection(): this is IntersectionType
	{
		return this._kind === TypeKind.Intersection;
	}

	/**
	 * Returns a value indicating whether the Type is a class or not.
	 */
	isClass(): this is ClassType
	{
		return this._kind === TypeKind.Class;
	}

	/**
	 * Returns a value indicating whether the Type is a interface or not.
	 */
	isInterface(): this is InterfaceType
	{
		return this._kind === TypeKind.Interface;
	}

	/**
	 * Returns a value indicating whether the Type is a interface or not.
	 */
	isTypeAlias(): this is TypeAliasType
	{
		return this._kind === TypeKind.Alias;
	}

	/**
	 * Returns a value indicating whether the Type is an literal or not.
	 */
	isLiteral(): this is LiteralType
	{
		return LiteralTypeKinds.has(this._kind);
	}

	/**
	 * Returns true if type is union or intersection of types
	 */
	isUnionOrIntersection(): this is (UnionType | IntersectionType)
	{
		return this.isUnion() || this.isIntersection();
	}

	/**
	 * Check if this type is an array.
	 */
	isArray(): this is GenericType<ClassType>
	{
		return this._kind === TypeKind.Array || this._kind === TypeKind.Tuple;
		// return (this.isNative() || this._kind == TypeKind.LiteralType) && this.name == "Array";
	}

	/**
	 * Check if this type is a Tuple.
	 */
	isTuple(): this is GenericType<ClassType>
	{
		return this._kind === TypeKind.Tuple;
	}

	/**
	 * Determines whether the object represented by the current Type is an Enum.
	 * @return {boolean}
	 */
	isEnum(): this is EnumType
	{
		return this._kind == TypeKind.Enum;
	}

	/**
	 * Determines whether the object represented by the current Type is an Conditional type.
	 * @return {boolean}
	 */
	isConditional(): this is ConditionalType
	{
		return this._kind == TypeKind.ConditionalType;
	}

	/**
	 * Determines whether the object represented by the current Type is an object-like type.
	 */
	isObjectLike(): this is ObjectLikeTypeBase
	{
		return this.isObject() || this.isClass() || this.isInterface();
	}

	/**
	 * Determines whether the object represented by the current Type is an Object type.
	 */
	isObject(): this is ObjectType
	{
		return this._kind == TypeKind.Object;
	}

	/**
	 * Determines whether the object represented by the current Type is an Template type.
	 */
	isTemplate(): this is TemplateType // TODO: TemplateLiteral vs Template expression
	{
		return this._kind == TypeKind.TemplateLiteral;
	}

	/**
	 * Determines whether the object represented by the current Type is a Function type.
	 */
	isFunction(): this is FunctionType
	{
		return this._kind == TypeKind.Function;
	}

	//////////////////////////////////////////////////////////////////// CHECKS /////////////////////////////////////////////////////////////////

	/**
	 * Returns true whether current Type is instantiable.
	 */
	isInstantiable(): boolean
	{
		return this.isClass() || this.isFunction(); // TODO: Array, Date etc...
	}

	/**
	 * Check if this is a primitive type ("string", "number", "boolean" etc.).
	 */
	isPrimitive(): boolean
	{
		return PrimitiveTypeKinds.has(this._kind);
	}

	// TODO: Remove this. This means many functions like isPromise(), isArray() etc. 
	//  Those are generic types so there should be something like .is(getType<Promise<any>>). 
	//  C# allows to write SomeGenericType<,> without specifying generic parameters. 
	//  We can use "any" but it will be strange for types with many generic parameters. .is(getType<SomeGenericType<any, any, any, any, any>)

	/**
	 * Check if this type is a string.
	 */
	isString(): boolean
	{
		return this._kind === TypeKind.String || this._kind === TypeKind.StringLiteral || this._kind === TypeKind.TemplateLiteral;
	}

	/**
	 * Check if this type is a number.
	 */
	isNumber(): boolean
	{
		return this._kind === TypeKind.Number || this._kind === TypeKind.NumberLiteral;
	}

	/**
	 * Check if this type is a bigint.
	 */
	isBigInt(): boolean
	{
		return this._kind === TypeKind.BigInt || this._kind === TypeKind.BigIntLiteral;
	}

	/**
	 * Check if this type is a boolean.
	 */
	isBoolean(): boolean
	{
		return this._kind === TypeKind.Boolean || this._kind === TypeKind.True || this._kind === TypeKind.False;
	}

	/**
	 * Check if this type is an "any".
	 */
	isAny(): boolean
	{
		return this._kind === TypeKind.Any;
	}

	/**
	 * Check if this type is an "never".
	 */
	isNever(): boolean
	{
		return this._kind === TypeKind.Never;
	}

	/**
	 * Check if this type is an "void".
	 */
	isVoid(): boolean
	{
		return this._kind === TypeKind.Void;
	}

	/**
	 * Check if this type is an "undefined".
	 */
	isUndefined(): boolean
	{
		return this._kind === TypeKind.Undefined;
	}

	/**
	 * Check if this type is an "null".
	 */
	isNull(): boolean
	{
		return this._kind === TypeKind.Null;
	}

	/**
	 * Returns string representation of the type.
	 * @returns {string} Returns string in format "Kind{fullName}"
	 */
	toString(): string
	{
		return `${TypeKind[this._kind]}\{${this.id}}`;
	}
}

export const NativeTypes: { [typeKind: number]: Type } = {
	[TypeKind.Invalid]: Type.Invalid,
	[TypeKind.Any]: Type.Any,
	[TypeKind.Unknown]: Type.Unknown,
	[TypeKind.Void]: Type.Void,
	[TypeKind.Never]: Type.Never,
	[TypeKind.Null]: Type.Null,
	[TypeKind.Undefined]: Type.Undefined,
	[TypeKind.NonPrimitiveObject]: Type.NonPrimitiveObject,
	[TypeKind.String]: Type.String,
	[TypeKind.Number]: Type.Number,
	[TypeKind.BigInt]: Type.BigInt,
	[TypeKind.Boolean]: Type.Boolean,
	[TypeKind.True]: Type.True,
	[TypeKind.False]: Type.False,
	[TypeKind.Date]: Type.Date,
	[TypeKind.Symbol]: Type.Symbol,
	[TypeKind.UniqueSymbol]: Type.UniqueSymbol,
	[TypeKind.RegExp]: Type.RegExp,
	[TypeKind.Int8Array]: Type.Int8Array,
	[TypeKind.Uint8Array]: Type.Uint8Array,
	[TypeKind.Uint8ClampedArray]: Type.Uint8ClampedArray,
	[TypeKind.Int16Array]: Type.Int16Array,
	[TypeKind.Uint16Array]: Type.Uint16Array,
	[TypeKind.Int32Array]: Type.Int32Array,
	[TypeKind.Uint32Array]: Type.Uint32Array,
	[TypeKind.Float32Array]: Type.Float32Array,
	[TypeKind.Float64Array]: Type.Float64Array,
	[TypeKind.BigInt64Array]: Type.BigInt64Array,
	[TypeKind.BigUint64Array]: Type.BigUint64Array,
} as const;