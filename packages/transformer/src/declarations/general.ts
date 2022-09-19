import {
	ModuleIdentifier,
	TypeIdentifier,
	TypeKind
}                         from "@rttist/abstract";
import { NativeTypeKind } from "@rttist/abstract/dist/enums/TypeKind";
import { ModuleIds }      from "@rttist/core";
import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import { TypeProperties } from "./TypeProperties";

export type PackageJson = {
	name?: string;
	dependencies?: string[];
	devDependencies?: string[];
};

/**
 * Package information.
 * @internal
 */
export type PackageInfo = {
	packageRoot: string;
	name: string;
	packageJson: PackageJson
}

/**
 * Type information.
 * @internal
 */
export type TypeInfo = { properties?: TypeProperties };

/**
 * @internal
 */
export type TransformerVisitor = (node: ts.Node, context: Context) => ts.VisitResult<ts.Node>;

/**
 * Request given keys to exist in type.
 */
export type Match<K extends keyof T, T> = {
	[P in K]: T[P];
};

/**
 * TypeReference for native types used inside transformer.
 */
export type TransformerNativeTypeReference = { kind: NativeTypeKind };

// TODO: Move it to custom file. 
/**
 * TypeReference used inside transformer. Change nativeReference to TyeKind -> remove TransformerNativeTypeReference type.
 */
export class TransformerTypeReference
{
	public static readonly Unknown = new TransformerTypeReference(ModuleIds.Unknown, "Unknown", TypeKind.Unknown);
	public static readonly Any = new TransformerTypeReference(ModuleIds.Unknown, "Any", TypeKind.Any);
	public static readonly Void = new TransformerTypeReference(ModuleIds.Unknown, "Void", TypeKind.Void);
	public static readonly Undefined = new TransformerTypeReference(ModuleIds.Unknown, "Undefined", TypeKind.Undefined);
	public static readonly Null = new TransformerTypeReference(ModuleIds.Unknown, "Null", TypeKind.Null);
	public static readonly Never = new TransformerTypeReference(ModuleIds.Unknown, "Never", TypeKind.Never);
	public static readonly String = new TransformerTypeReference(ModuleIds.Native, "String", TypeKind.String);
	public static readonly Number = new TransformerTypeReference(ModuleIds.Native, "Number", TypeKind.Number);
	public static readonly Boolean = new TransformerTypeReference(ModuleIds.Native, "Boolean", TypeKind.Boolean);
	public static readonly BigInt = new TransformerTypeReference(ModuleIds.Native, "BigInt", TypeKind.BigInt);
	public static readonly Symbol = new TransformerTypeReference(ModuleIds.Native, "Symbol", TypeKind.Symbol);

	private readonly _native: boolean;
	private readonly _module: ModuleIdentifier;
	private readonly _name: string;
	private readonly _id: TypeIdentifier;
	private readonly _nativeReference?: TransformerNativeTypeReference;

	get nativeReference(): TransformerNativeTypeReference | undefined
	{
		return this._nativeReference;
	}

	get id(): TypeIdentifier
	{
		return this._id;
	}

	get name(): string
	{
		return this._name;
	}

	get moduleIdentifier(): ModuleIdentifier
	{
		return this._module;
	}

	/**
	 * @param module
	 * @param typeName
	 * @param nativeTypeKnd
	 * @param typeArguments
	 */
	constructor(module: ModuleIdentifier, typeName: string, nativeTypeKnd?: NativeTypeKind, typeArguments?: string[])
	{
		this._module = module;
		this._name = typeName;
		this._id = this.createTypeId(module, typeName, typeArguments);

		if ((this._native = (nativeTypeKnd !== undefined)))
		{
			this._nativeReference = { kind: nativeTypeKnd };
		}
	}

	isNative(): this is NativeTransformerTypeReference
	{
		return this._native;
	}

	private createTypeId(module: ModuleIdentifier, identifier: TypeIdentifier, typeArguments?: string[])
	{
		let id = module + "::" + identifier;

		if (typeArguments?.length)
		{
			id += "{" + typeArguments.join(",") + "}";
		}

		return id;
	}
}

export type NativeTransformerTypeReference = TransformerTypeReference & {
	get nativeReference(): TransformerNativeTypeReference;
};

/**
 * TS Type by our type reference.
 */
export type ReflectedTypeWithReference = ts.Type & { _typeReference: TransformerTypeReference };

/**
 * Extended SourceFile with our reflection info.
 */
export type ReflectedSourceFileWithIdentifier = ts.SourceFile & { _reflectId: string };