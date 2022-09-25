import {
	AccessModifier,
	ClassTypeMetadata,
	DecoratorInfo,
	DecoratorInfoInitializer,
	IndexInfoInitializer,
	InterfaceTypeMetadata,
	MethodFlags,
	MethodInfoInitializer,
	ModuleIdentifier,
	ModuleReference,
	ObjectLikeBaseTypeMetadata,
	ParameterFlags,
	ParameterInfoInitializer,
	PropertyFlags,
	PropertyInfoInitializer,
	Signature,
	SignatureInitializerBase,
	TypeIdentifier,
	TypeKind,
	TypeMetadata
}                         from "@rttist/abstract";
import { NativeTypeKind } from "@rttist/abstract/dist/enums/TypeKind";
import {
	Match,
	TransformerTypeReference
}                         from "./general";

/**
 * Properties of general Type.
 */
type BaseTypeProperties = Match<keyof TypeMetadata, {
	id?: TypeIdentifier;
	kind: TypeKind;
	name?: string;
	// fullName?: string;
	module?: ModuleReference;
	exported?: true;
	typeArguments?: TransformerTypeReference[];
	nullable?: true;
	genericTypeDefinition?: TransformerTypeReference;
	isGenericTypeDefinition?: true;
}>;

export type NativeBaseTypeProperties =
	Omit<BaseTypeProperties, "id" | "kind">
	& { kind: NativeTypeKind, id?: undefined };
export type NonNativeBaseTypeProperties =
	Omit<BaseTypeProperties, "id" | "kind">
	& { id: TypeIdentifier, kind: TypeKind };

/**
 * Properties of a Module.
 */
export type ModuleProperties = {
	id: ModuleIdentifier;
	name: string;
	path: string;
	children?: ModuleReference[];
	types?: TypeProperties[];
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

export type ParameterProperties = Match<keyof ParameterInfoInitializer,
	{
		name: string;
		type: TransformerTypeReference;
		flags: ParameterFlags;
		initializer?: any;
		decorators?: DecoratorProperties[];
	}>;

export type SignatureProperties = Match<keyof SignatureInitializerBase,
	{
		parameters?: Array<ParameterProperties>;
		typeParameters?: TransformerTypeReference[];
		returnType: TransformerTypeReference;
	}>;

export type MethodProperties = Match<keyof MethodInfoInitializer,
	{
		flags: MethodFlags;
		name: string;
		signatures: SignatureProperties[];
		decorators?: DecoratorProperties[];
	}>;

// export interface TemplateProperties extends TemplateInfoInitializer
// {
// }

export interface TypeParameterProperties extends NonNativeBaseTypeProperties
{
	constraint?: TransformerTypeReference;
	default?: TransformerTypeReference;
}

export type PropertyProperties = Match<keyof PropertyInfoInitializer, {
	name: string;
	flags: PropertyFlags;
	type: TransformerTypeReference;
	decorators?: Array<DecoratorProperties>;
}>;

export interface IndexProperties extends Omit<IndexInfoInitializer, "key" | "type">
{
	key: TransformerTypeReference;
	type: TransformerTypeReference;
}

export type DecoratorProperties = Match<keyof DecoratorInfoInitializer,
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

export type ObjectProperties = Match<keyof ObjectLikeBaseTypeMetadata,
	NonNativeBaseTypeProperties & {
	properties?: PropertyProperties[];
	indexes?: IndexProperties[];
	methods?: MethodProperties[];
}>;

export type ImportDetails = {
	module: string,
	exportName: string
};

export type ClassProperties = Match<keyof ClassTypeMetadata,
	ObjectProperties & {
	ctor?: ImportDetails;
	ctorSync?: ImportDetails;
	constructors?: ReadonlyArray<SignatureProperties>;
	extends?: TransformerTypeReference;
	implements?: TransformerTypeReference[];
	decorators?: ReadonlyArray<DecoratorProperties>;
	abstract?: true;
}>;

export type InterfaceProperties = Match<keyof InterfaceTypeMetadata,
	ObjectProperties & {
	extends?: TransformerTypeReference[];
}>;

/**
 * Properties of a Type.
 */
export type TypeProperties = NativeBaseTypeProperties | NonNativeBaseTypeProperties
	| LiteralTypeProperties
	| UnionTypeProperties
	| IntersectionTypeProperties
	| ObjectProperties
	| TypeParameterProperties
	| ClassProperties
	| InterfaceProperties
	;
