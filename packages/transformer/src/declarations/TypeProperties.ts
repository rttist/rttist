import {
	ClassTypeMetadata,
	DecoratorInfoMetadata,
	IndexInfoMetadata,
	InterfaceTypeMetadata,
	MethodFlags,
	MethodInfoMetadata,
	ModuleIdentifier,
	ModuleReference,
	ObjectLikeBaseTypeMetadata,
	ParameterFlags,
	ParameterInfoMetadata,
	PropertyFlags,
	PropertyInfoMetadata,
	SignatureMetadataBase,
	TypeIdentifier,
	TypeKind,
	TypeMetadata,
	NativeTypeKind,
	TypeAliasTypeMetadata,
	UniqueSymbolTypeMetadata,
	MemberNameMetadata,
	ConditionalTypeMetadata,
	EnumTypeMetadata,
	EnumLiteralTypeMetadata,
	FunctionTypeMetadata
}                                   from "rttist";
import ts                           from "typescript";
import { TransformerTypeReference } from "./TransformerTypeReference";

/**
 * Request given keys to exist in type.
 */
export type Match<K extends keyof T, T> = {
	[P in K]: T[P];
};

/**
 * Properties of general Type.
 */
export type BaseTypeProperties = Match<keyof TypeMetadata, {
	id?: TypeIdentifier;
	kind: TypeKind;
	name?: string;
	module?: ModuleIdentifier;
	exported?: boolean;
	typeArguments?: TransformerTypeReference[];
	nullable?: true;
	genericTypeDefinition?: TransformerTypeReference;
	isGenericTypeDefinition?: true;
}>;

export type NativeBaseTypeProperties =
	Omit<BaseTypeProperties, "id" | "kind">
	& { kind: NativeTypeKind, id?: undefined };

export type NonNativeBaseTypeProperties = Match<keyof Omit<BaseTypeProperties, "id">, {
	kind: TypeKind;
	name: string;
	module?: ModuleIdentifier;
	exported?: boolean;
	nullable?: true;
	isGenericTypeDefinition?: true;
	typeArguments?: TransformerTypeReference[];
	genericTypeDefinition?: TransformerTypeReference;
}>;

/**
 * Properties of a Module.
 */
export type ModuleProperties = {
	id: ModuleIdentifier;
	name: string;
	path: string;
	import?: ts.FunctionLikeDeclarationBase;
	children?: ModuleReference[];
	types?: TypePropertiesWithId[];
};

export type ModuleMetadataProperties = Omit<ModuleProperties, "types">;

/**
 * Metadata about all the modules and its types.
 */
export interface MetadataSource
{
	modules: ModuleProperties[];
}

export interface ImportInfo
{
	path: string;
	exportName: string;
}

export type ParameterProperties = Match<keyof ParameterInfoMetadata,
	{
		name: string;
		type: TransformerTypeReference;
		flags: ParameterFlags;
		initializer?: any;
		decorators?: DecoratorProperties[];
	}>;

export type SignatureProperties = Match<keyof SignatureMetadataBase,
	{
		parameters?: Array<ParameterProperties>;
		typeParameters?: TransformerTypeReference[];
		returnType: TransformerTypeReference;
	}>;

export type MethodProperties = Match<keyof MethodInfoMetadata,
	{
		flags: MethodFlags;
		name: MemberNameProperties;
		signatures: SignatureProperties[];
		decorators?: DecoratorProperties[];
	}>;

// export interface TemplateProperties extends TemplateInfoMetadata
// {
// }

export interface TypeParameterProperties extends NonNativeBaseTypeProperties
{
	constraint?: TransformerTypeReference;
	default?: TransformerTypeReference;
}

export type MemberNameProperties = MemberNameMetadata;

export type PropertyProperties = Match<keyof PropertyInfoMetadata, {
	name: MemberNameProperties;
	flags: PropertyFlags;
	type: TransformerTypeReference;
	decorators?: Array<DecoratorProperties>;
}>;

export type ConditionalTypeProperties = Match<keyof Omit<ConditionalTypeMetadata, "id">, NonNativeBaseTypeProperties & {
	extends: TransformerTypeReference;
	trueType: TransformerTypeReference;
	falseType: TransformerTypeReference;
}>;

export interface IndexProperties extends Omit<IndexInfoMetadata, "key" | "type">
{
	key: TransformerTypeReference;
	type: TransformerTypeReference;
}

export type DecoratorProperties = Match<keyof DecoratorInfoMetadata,
	{
		name: string;
		id: TypeIdentifier;
		args?: Array<any>;
	}>;

/**
 * Properties of a LiteralType.
 */
export type LiteralTypeProperties = (NativeBaseTypeProperties | NonNativeBaseTypeProperties) & {
	value?: any;
};

export type UnionTypeProperties = NonNativeBaseTypeProperties & {
	types: TransformerTypeReference[];
}

export type IntersectionTypeProperties = NonNativeBaseTypeProperties & {
	types: TransformerTypeReference[];
}

export type ObjectProperties = Match<keyof Omit<ObjectLikeBaseTypeMetadata, "id">,
	NonNativeBaseTypeProperties & {
	properties?: PropertyProperties[];
	indexes?: IndexProperties[];
	methods?: MethodProperties[];
}>;

export type ImportDetails = {
	module: string,
	exportName: string
};

export type ClassProperties = Match<keyof Omit<ClassTypeMetadata, "id">,
	ObjectProperties & {
	ctor?: ImportDetails;
	ctorSync?: ImportDetails;
	constructors?: ReadonlyArray<SignatureProperties>;
	extends?: TransformerTypeReference;
	implements?: TransformerTypeReference[];
	decorators?: ReadonlyArray<DecoratorProperties>;
	abstract?: true;
}>;

export type InterfaceProperties = Match<keyof Omit<InterfaceTypeMetadata, "id">,
	ObjectProperties & {
	extends?: TransformerTypeReference[];
}>;

export type TypeAliasProperties = Match<keyof Omit<TypeAliasTypeMetadata, "id">,
	NonNativeBaseTypeProperties & {
	target: TransformerTypeReference;
}>;

export type UniqueSymbolProperties = Match<keyof Omit<UniqueSymbolTypeMetadata, "id">,
	NonNativeBaseTypeProperties & {
	key?: string;
}>;

export type EnumProperties = Match<keyof Omit<EnumTypeMetadata, "id">, // TODO: Refactor names of types and properties. EnumType vs Enum? Function vs FunctionType, Object vs ObjectType
	NonNativeBaseTypeProperties & {
	kind: TypeKind.Enum;
	const: boolean;
	entries: { [key: string]: number | string };
}>;

export type EnumLiteralProperties = Match<keyof Omit<EnumLiteralTypeMetadata, "id">, // TODO: Refactor names of types and properties. EnumType vs Enum? Function vs FunctionType, Object vs ObjectType
	NonNativeBaseTypeProperties & {
	kind: TypeKind.EnumLiteral;
	value: number | string;
	enum: TransformerTypeReference;
}>;

export type FunctionProperties = Match<keyof Omit<FunctionTypeMetadata, "id">, // TODO: Refactor names of types and properties. EnumType vs Enum? Function vs FunctionType, Object vs ObjectType
	NonNativeBaseTypeProperties & {
	kind: TypeKind.Function;
	signatures: SignatureProperties[];
}>;

/**
 * Properties of a Type.
 */
export type TypeProperties = NativeBaseTypeProperties// | NonNativeBaseTypeProperties
	| LiteralTypeProperties
	| UnionTypeProperties
	| IntersectionTypeProperties
	| ObjectProperties
	| TypeParameterProperties
	| ClassProperties
	| InterfaceProperties
	| UniqueSymbolProperties
	| ConditionalTypeProperties
	| EnumProperties
	| EnumLiteralProperties
	| FunctionProperties
	;

export type TypePropertiesWithId = TypeProperties & {
	id: TypeIdentifier;
};