import type * as ts from "typescript";
import type {
	NativeTransformerTypeReference,
	TransformerNativeTypeReference
} from "./general";
import {
	ModuleIdentifier,
	TypeIdentifier,
	TypeKind,
	NativeTypeKind
} from "rttist";
import { ModuleIds } from "@rttist/core";

/**
 * TypeReference used inside transformer. Change nativeReference to TyeKind -> remove TransformerNativeTypeReference
 * type.
 */
export class TransformerTypeReference
{
	public static readonly Unknown = new TransformerTypeReference(ModuleIds.Native, "Unknown", TypeKind.Unknown);
	public static readonly Invalid = new TransformerTypeReference(ModuleIds.Native, "Invalid", TypeKind.Invalid);
	public static readonly Any = new TransformerTypeReference(ModuleIds.Native, "Any", TypeKind.Any);
	public static readonly NonPrimitiveObject = new TransformerTypeReference(ModuleIds.Native, "object", TypeKind.NonPrimitiveObject);
	public static readonly Void = new TransformerTypeReference(ModuleIds.Native, "Void", TypeKind.Void);
	public static readonly Undefined = new TransformerTypeReference(ModuleIds.Native, "Undefined", TypeKind.Undefined);
	public static readonly Null = new TransformerTypeReference(ModuleIds.Native, "Null", TypeKind.Null);
	public static readonly Never = new TransformerTypeReference(ModuleIds.Native, "Never", TypeKind.Never);
	public static readonly String = new TransformerTypeReference(ModuleIds.Native, "String", TypeKind.String);
	public static readonly Number = new TransformerTypeReference(ModuleIds.Native, "Number", TypeKind.Number);
	public static readonly Boolean = new TransformerTypeReference(ModuleIds.Native, "Boolean", TypeKind.Boolean);
	public static readonly True = new TransformerTypeReference(ModuleIds.Native, "true", TypeKind.True);
	public static readonly False = new TransformerTypeReference(ModuleIds.Native, "false", TypeKind.False);
	public static readonly BigInt = new TransformerTypeReference(ModuleIds.Native, "BigInt", TypeKind.BigInt);
	public static readonly Symbol = new TransformerTypeReference(ModuleIds.Native, "Symbol", TypeKind.Symbol);
	public static readonly Date = new TransformerTypeReference(ModuleIds.Native, "Date", TypeKind.Date);
	public static readonly Error = new TransformerTypeReference(ModuleIds.Native, "Error", TypeKind.Error);
	public static readonly RegExp = new TransformerTypeReference(ModuleIds.Native, "RegExp", TypeKind.RegExp);
	public static readonly RttistType = new TransformerTypeReference(ModuleIds.Native, "Type", TypeKind.RttistType);
	public static readonly RttistModule = new TransformerTypeReference(ModuleIds.Native, "Module", TypeKind.RttistModule);

	private readonly _native: boolean;
	private readonly _module: ModuleIdentifier;
	private readonly _name: string;
	private readonly _id: TypeIdentifier;
	private readonly _nativeReference?: TransformerNativeTypeReference;

	public readonly sourceFile?: ts.SourceFile;

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
	 * @param sourceFile
	 * @param module
	 * @param typeName
	 * @param nativeTypeKnd
	 * @param typeArguments
	 */
	constructor(
		module: ModuleIdentifier,
		typeName: string,
		nativeTypeKnd?: NativeTypeKind,
		typeArguments?: string[],
		sourceFile?: ts.SourceFile
	)
	{
		this._module = module;
		this._name = typeName;
		this._id = this.createTypeId(module, typeName, typeArguments);
		this.sourceFile = sourceFile;

		if ((this._native = (nativeTypeKnd !== undefined)))
		{
			this._nativeReference = { kind: nativeTypeKnd };
		}
	}

	isKindOnly(): this is NativeTransformerTypeReference
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