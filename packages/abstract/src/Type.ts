// noinspection JSUnusedGlobalSymbols

import type {
	TypeIdentifier,
	TypeMetadata,
}                      from "./declarations";
import type {
	ClassType,
	ConditionalType,
	EnumType,
	ExtendableObjectLikeTypeBase,
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
}                      from "./types";
import type { Module } from "./Module";

import {
	ModuleIds,
	NativeTypeIdPrefix
}                        from "./const-type-identifiers";
import { LazyModule }    from "./LazyModule";
import { LazyTypeArray } from "./LazyTypeArray";
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
		id: NativeTypeIdPrefix + name,
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
	public static readonly Any: Type = cn("any", TypeKind.Any);
	public static readonly Unknown: Type = cn("unknown", TypeKind.Unknown);
	public static readonly Void: Type = cn("void", TypeKind.Void);
	public static readonly Never: Type = cn("never", TypeKind.Never);
	public static readonly Null: Type = cn("null", TypeKind.Null);
	public static readonly Undefined: Type = cn("undefined", TypeKind.Undefined);
	public static readonly Object: Type = cn("Object", TypeKind.Object);
	public static readonly String: Type = cn("String", TypeKind.String);
	public static readonly Number: Type = cn("Number", TypeKind.Number);
	public static readonly BigInt: Type = cn("BigInt", TypeKind.BigInt);
	public static readonly Boolean: Type = cn("Boolean", TypeKind.Boolean);
	public static readonly Date: Type = cn("Date", TypeKind.Date);
	public static readonly Symbol: Type = cn("Symbol", TypeKind.Symbol);
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

	// private _flattened?: { properties: { [p: string]: PropertyInfo }; methods: { [p: string]: MethodInfo } };


	private readonly _id: TypeIdentifier;
	private readonly _kind: TypeKind;
	private readonly _fullName: string;
	private readonly _name: string;
	private readonly _exported: boolean;
	private readonly _moduleRef: LazyModule;
	private readonly _typeParametersRef: LazyTypeArray;

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
	 * Full qualified name of the type.
	 * @description Contains file path based to project root.
	 */
	get fullName(): string
	{
		return this._fullName;
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
		this._fullName = initializer.fullName || "";
		this._exported = initializer.exported || false;

		this._moduleRef = new LazyModule(initializer.module);
		this._typeParametersRef = new LazyTypeArray(initializer.typeParameters || []);
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
	 * Returns array of generic type parameters.
	 * @internal Exposed by {@link GenericType}.
	 */
	getTypeParameters(): ReadonlyArray<Type>
	{
		return this._typeParametersRef.types;
	}

	//////////////////////////////////////////////////////////////////// GUARDS /////////////////////////////////////////////////////////////////

	/**
	 * Check whether the type is generic.
	 */
	isGenericType(): this is GenericType<Type>
	{
		return this._typeParametersRef.length > 0;
	}

	/**
	 * Check whether the type is generic.
	 */
	isTypeParameter(): this is TypeParameterType
	{
		return false;
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
	 * Returns a value indicating whether the Type can extend other type or not.
	 * @description True for classes and interfaces.
	 */
	isExtendable(): this is ExtendableObjectLikeTypeBase
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
	 * Returns a value indicating whether the Type is an literal or not.
	 */
	isLiteral(): this is LiteralType
	{
		return LiteralTypeKinds.indexOf(this._kind) !== -1;
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
	 * Determines whether the object represented by the current Type is an Function type.
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
		return this.isClass(); // TODO: Array, Date etc...
	}

	/**
	 * Check if this is a primitive type ("string", "number", "boolean" etc.).
	 */
	isPrimitive(): boolean
	{
		return PrimitiveTypeKinds.indexOf(this._kind) !== -1;
	}

	// TODO: Remove this. This means many functions like isPromise(), isArray() etc. 
	//  Those are generic types so there should be something like .is(getType<Promise<any>>). 
	//  C# allows to write SomeGenericType<,> without specifying generic parameters. 
	//  We can use "any" but it will be strange for types with many generic parameters. .is(getType<SomeGenericType<any, any, any, any, any>)
	// /**
	//  * Returns true whether the Type is a Promise.
	//  */
	// isPromise(): boolean
	// {
	// 	return this._kind === TypeKind.Promise;
	// }

	// TODO: Remove. The Type.is() should be used; eg. .is(Type.String), .is(Type.Never) 
	// /**
	//  * Check if this type is a string.
	//  */
	// isString(): boolean
	// {
	// 	return this._kind === TypeKind.String || this._kind === TypeKind.StringLiteral || this._kind === TypeKind.TemplateLiteral;
	// }
	//
	// /**
	//  * Check if this type is a number.
	//  */
	// isNumber(): boolean
	// {
	// 	return this._kind === TypeKind.Number || this._kind === TypeKind.NumberLiteral;
	// }
	//
	// /**
	//  * Check if this type is a bigint.
	//  */
	// isBigInt(): boolean
	// {
	// 	return this._kind === TypeKind.BigInt || this._kind === TypeKind.BigIntLiteral;
	// }
	//
	// /**
	//  * Check if this type is a boolean.
	//  */
	// isBoolean(): boolean
	// {
	// 	return this._kind === TypeKind.Boolean || this._kind === TypeKind.BooleanLiteral;
	// 	// return (this.isNative() || this._kind == TypeKind.LiteralType) && this.name == "boolean";
	// }
	//
	// /**
	//  * Check if this type is an "any".
	//  */
	// isAny(): boolean
	// {
	// 	return this._kind === TypeKind.Any;
	// }
	//
	// /**
	//  * Check if this type is an "never".
	//  */
	// isNever(): boolean
	// {
	// 	return this._kind === TypeKind.Never;
	// }
	//
	// /**
	//  * Check if this type is an "void".
	//  */
	// isVoid(): boolean
	// {
	// 	return this._kind === TypeKind.Void;
	// }
	//
	// /**
	//  * Check if this type is an "undefined".
	//  */
	// isUndefined(): boolean
	// {
	// 	return this._kind === TypeKind.Undefined;
	// }
	//
	// /**
	//  * Check if this type is an "null".
	//  */
	// isNull(): boolean
	// {
	// 	return this._kind === TypeKind.Null;
	// }

	/**
	 * @return {boolean}
	 */
	isObjectLike(): this is ObjectLikeTypeBase
	{
		return this.isObject() || this.isClass() || this.isInterface();
	}

	// TODO: isTemplate vs isTemplateLiteral.
	// /**
	//  * Returns a value indicating whether the Type is an template literal or not.
	//  */
	// isTemplateLiteral(): boolean
	// {
	// 	return this._kind === TypeKind.TemplateLiteral;
	// }

	/**
	 * Returns string representation of the type.
	 * @returns {string} Returns string in format "Kind{fullName}"
	 */
	toString(): string
	{
		return `${TypeKind[this._kind]}\{${this.fullName}}`;
	}


	//////////////////////////////////////////////    NOT REFACTORED   ///////////////////////////////////////

	// /**
	//  * Returns object with all methods and properties from current Type and all methods and properties inherited from base types and interfaces to this Type.
	//  */
	// flattenInheritedMembers(): FlattenedObject
	// {
	// 	return this._flattened ?? (this._flattened = flatten(this));
	// }
	//
	// /**
	//  * Determines whether the Object represented by the current Type is structurally compatible and assignable to the Object represented by the specified Type.
	//  * @experimental
	//  * @param {Type} target
	//  * @return {boolean}
	//  */
	// isStructurallyAssignableTo(target: Type): boolean
	// {
	// 	if (!this.isObjectLike() || !target.isObjectLike())
	// 	{
	// 		return false;
	// 	}
	//
	// 	const currentMembers = this.flattenInheritedMembers();
	// 	const currentProperties = Object.values(currentMembers.properties);
	// 	const currentMethods = Object.values(currentMembers.methods);
	//
	// 	const targetMembers: FlattenedObject = target.flattenInheritedMembers();
	// 	const targetProperties: PropertyInfo[] = Object.values(targetMembers.properties);
	// 	const targetMethods: MethodInfo[] = Object.values(targetMembers.methods);
	//
	// 	// All the target properties are required (may be optional), so all of them must be present in current Type.. to be assignable
	// 	return targetProperties.every(targetProperty =>
	// 				targetProperty.optional || currentProperties.some(currentProperty =>
	// 					currentProperty.name == targetProperty.name
	// 					&& currentProperty.type.isAssignableTo(targetProperty.type)
	// 				)
	// 		)
	// 		// same for methods. All targets methods must be present in current Type (methods are matched by name and parameters' types)
	// 		&& targetMethods.every(targetMethod =>
	// 				targetMethod.optional || currentMethods.some(currentMethod => {
	// 					const currentMethodParameters = currentMethod.getParameters();
	//
	// 					return currentMethod.name == targetMethod.name
	// 						&& targetMethod.getParameters().every((targetMethodParam, i) => {
	// 							const currentMethodParam: ParameterInfo | undefined = currentMethodParameters[i];
	//
	// 							if (currentMethodParam == undefined)
	// 							{
	// 								return targetMethodParam.optional;
	// 							}
	//
	// 							return currentMethodParam.type.isAssignableTo(targetMethodParam.type);
	// 						});
	// 				})
	// 		);
	// }
	//
	// /**
	//  * Determines whether an instance of the current Type can be assigned to an instance of the specified Type.
	//  * @experimental
	//  * @description This is fulfilled by derived types or compatible types.
	//  * @param target
	//  */
	// isAssignableTo(target: Type): boolean
	// {
	// 	if (this.isAny() || target.isAny())
	// 	{
	// 		return true;
	// 	}
	//
	// 	// Container types check
	// 	if (this.isUnionOrIntersection() || target.isUnionOrIntersection())
	// 	{
	// 		// target type is not container but source is => not assignable
	// 		if (!target.isUnionOrIntersection())
	// 		{
	// 			return false;
	// 		}
	//
	// 		const targetTypes = target.types;
	//
	// 		// Source is not container, but it can be subtype
	// 		if (!this.isUnionOrIntersection())
	// 		{
	// 			return targetTypes.some(targetType => this.isAssignableTo(targetType)) || false;
	// 		}
	//
	// 		// -- both types are container
	//
	// 		// containers' types do not match (union vs intersection)
	// 		if (!(this.isUnion() == target.isUnion() && this.isIntersection() == target.isIntersection()))
	// 		{
	// 			return false;
	// 		}
	//
	// 		return this.types.every(thisType => targetTypes.some(targetType => thisType.isAssignableTo(targetType))) || false;
	// 	}
	//
	// 	// It is array. Type of array must match.
	// 	if (this.isArray())
	// 	{
	// 		if (!target.isArray())
	// 		{
	// 			return false;
	// 		}
	//
	// 		const thisTypeParam = this.getTypeParameters()[0];
	// 		const targetTypeParam = target.getTypeParameters()[0];
	//
	// 		return thisTypeParam.isAssignableTo(targetTypeParam);
	// 	}
	//
	// 	return (this.isExtendable() && this.isDerivedFrom(target))
	// 		// anonymous type check
	// 		|| this.isStructurallyAssignableTo(target)
	// 		|| false;
	// }
}

export const NativeTypes: { [typeKind: number]: Type } = {
	[TypeKind.Any]: Type.Any,
	[TypeKind.Unknown]: Type.Unknown,
	[TypeKind.Void]: Type.Void,
	[TypeKind.Never]: Type.Never,
	[TypeKind.Null]: Type.Null,
	[TypeKind.Undefined]: Type.Undefined,
	[TypeKind.Object]: Type.Object,
	[TypeKind.String]: Type.String,
	[TypeKind.Number]: Type.Number,
	[TypeKind.BigInt]: Type.BigInt,
	[TypeKind.Boolean]: Type.Boolean,
	[TypeKind.Date]: Type.Date,
	[TypeKind.Symbol]: Type.Symbol,
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