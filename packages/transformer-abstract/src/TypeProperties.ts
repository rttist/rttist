import {
	ClassTypeMetadata,
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
	SignatureInitializerBase,
	TypeIdentifier,
	TypeKind,
	TypeMetadata,
	NativeTypeKind,
	TypeAliasTypeMetadata,
	UniqueSymbolTypeMetadata,
	MemberNameInitializer
} from "rttist";
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
	typeArguments?: TransformerTypeReference[];
	nullable?: true;
	genericTypeDefinition?: TransformerTypeReference;
	isGenericTypeDefinition?: true;
}>;

/**
 * Properties of a Module.
 */
export type ModuleProperties = {
	id: ModuleIdentifier;
	name: string;
	path: string;
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
		name: MemberNameProperties;
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

export type MemberNameProperties = MemberNameInitializer;

export type PropertyProperties = Match<keyof PropertyInfoInitializer, {
	name: MemberNameProperties;
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
	| UniqueSymbolProperties
	;

export type TypePropertiesWithId = TypeProperties & {
	id: TypeIdentifier;
};