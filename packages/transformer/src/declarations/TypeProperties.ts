import {
	AccessModifier,
	DecoratorInfoInitializer,
	IndexInfoInitializer,
	ModuleIdentifier,
	ModuleReference,
	PropertyFlags,
	PropertyInfoInitializer,
	TypeIdentifier,
	TypeKind,
	TypeMetadata
} from "@rtti/abstract";
import { NativeTypeKind } from "@rtti/abstract/dist/enums/TypeKind";
import { Match, TransformerTypeReference } from "./general";

/**
 * Properties of general Type.
 */
type BaseTypeProperties = Match<keyof TypeMetadata, {
	id?: TypeIdentifier;
	kind: TypeKind;
	name?: string;
	fullName?: string;
	module?: ModuleReference;
	exported?: true;
	typeParameters?: TypeParameterProperties[];
}>;

export type NativeBaseTypeProperties = Omit<BaseTypeProperties, "id" | "kind"> & { kind: NativeTypeKind, id?: undefined };
export type NonNativeBaseTypeProperties = Omit<BaseTypeProperties, "id" | "kind"> & { id: TypeIdentifier, kind: TypeKind };

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

export interface ParameterProperties
{
	name: string;
	type: TransformerTypeReference;
	optional?: boolean;
	rest?: boolean;
}

export interface MethodBaseProperties
{
	parameters: Array<ParameterProperties>;
}

export interface ConstructorProperties extends MethodBaseProperties
{
}

export interface MethodProperties extends MethodBaseProperties
{
	name: string;
	typeParameters?: TransformerTypeReference[];
	returnType: TransformerTypeReference;
	optional?: boolean;
	accessModifier?: AccessModifier;
	decorators?: DecoratorProperties[];
}

// export interface TemplateProperties extends TemplateInfoInitializer
// {
// }

export interface TypeParameterProperties extends NonNativeBaseTypeProperties
{
	genericTypeDefinition?: TransformerTypeReference;
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

export interface DecoratorProperties extends DecoratorInfoInitializer
{
}

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

export type ObjectProperties = NonNativeBaseTypeProperties & {
	properties?: PropertyProperties[];
	indexes?: IndexProperties[];
	methods?: MethodProperties[];
}

/**
 * Properties of a Type.
 */
export type TypeProperties = NativeBaseTypeProperties | NonNativeBaseTypeProperties
	| LiteralTypeProperties
	| UnionTypeProperties
	| IntersectionTypeProperties
	| ObjectProperties
	| TypeParameterProperties
	;
