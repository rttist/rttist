import type {
	AsyncCtorReference,
	DecoratorInfo,
	MethodInfo,
	ModuleIdentifier,
	PropertyInfo,
	SyncCtorReference,
	TypeIdentifier,
	TypeReference,
	IndexInfo,
	Signature
}                        from "./index";
import type { TypeKind } from "../enums";

export interface TypeMetadata
{
	id: TypeIdentifier;
	kind: TypeKind;
	module: ModuleIdentifier;
	name: string;
	// fullName?: string;
	exported?: boolean;
	typeParameters?: TypeReference[];
	nullable?: true;
}

export interface ObjectLikeBaseTypeMetadata extends TypeMetadata
{
	properties: ReadonlyArray<PropertyInfo>;
	methods: ReadonlyArray<MethodInfo>;
	indexes: ReadonlyArray<IndexInfo>;
}

export interface ExtendableObjectLikeBaseTypeMetadata extends ObjectLikeBaseTypeMetadata
{
	baseType?: TypeReference;
}

export interface LiteralTypeMetadata extends TypeMetadata
{
	value?: any;
}

export interface TypeParameterTypeMetadata extends TypeMetadata
{
	genericTypeDefinition: TypeReference;
	constraint?: TypeReference;
	default?: TypeReference;
}

export interface ClassTypeMetadata extends ExtendableObjectLikeBaseTypeMetadata
{
	ctor: AsyncCtorReference;
	ctorSync?: SyncCtorReference;
	constructors: ReadonlyArray<Signature>;
	interface?: TypeReference;
	decorators: ReadonlyArray<DecoratorInfo>;
}

export interface InterfaceTypeMetadata extends ExtendableObjectLikeBaseTypeMetadata
{
}

export interface TypeAliasTypeMetadata extends TypeMetadata
{
	target: TypeReference;
}

export interface UnionOrIntersectionTypeMetadata extends TypeMetadata
{
	types?: Array<TypeReference>;
}

export interface UnionTypeMetadata extends UnionOrIntersectionTypeMetadata
{
	types?: Array<TypeReference>;
}

export interface EnumTypeMetadata extends UnionTypeMetadata
{
}

export interface TemplateTypeMetadata extends TypeMetadata
{
	head: string;
	templateSpans: Array<{ expression: string, literal: string }>;
}

export interface ConditionalTypeMetadata extends TypeMetadata
{
	extends: TypeReference;
	trueType: TypeReference;
	falseType: TypeReference;
}

export interface FunctionTypeMetadata extends TypeMetadata
{
	signatures: Signature[];
}