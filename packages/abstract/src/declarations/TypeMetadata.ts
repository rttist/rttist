import type { TypeKind } from "../enums";
import type {
	AsyncCtorReference,
	DecoratorInfo,
	IndexInfo,
	MethodInfo,
	ModuleIdentifier,
	PropertyInfo,
	Signature,
	SyncCtorReference,
	TypeIdentifier,
	TypeReference
}                        from "./index";

export interface TypeMetadata
{
	id: TypeIdentifier;
	kind: TypeKind;
	module: ModuleIdentifier;
	name: string;
	exported?: boolean;
	typeArguments?: TypeReference[];
	nullable?: boolean;
	genericTypeDefinition?: TypeReference;
	isGenericTypeDefinition?: boolean;
}

export interface ObjectLikeBaseTypeMetadata extends TypeMetadata
{
	properties: ReadonlyArray<PropertyInfo>;
	methods: ReadonlyArray<MethodInfo>;
	indexes: ReadonlyArray<IndexInfo>;
}

export interface LiteralTypeMetadata extends TypeMetadata
{
	value?: any;
}

export interface TypeParameterTypeMetadata extends TypeMetadata
{
	constraint?: TypeReference;
	default?: TypeReference;
}

export interface ClassTypeMetadata extends ObjectLikeBaseTypeMetadata
{
	ctor?: AsyncCtorReference;
	ctorSync?: SyncCtorReference;
	constructors: ReadonlyArray<Signature>;
	implements?: TypeReference[];
	decorators: ReadonlyArray<DecoratorInfo>;
	abstract?: boolean;
	extends?: TypeReference;
}

export interface InterfaceTypeMetadata extends ObjectLikeBaseTypeMetadata
{
	extends?: TypeReference[];
}

export interface TypeAliasTypeMetadata extends TypeMetadata
{
	target: TypeReference;
}

export interface ESSymbolTypeMetadata extends TypeMetadata
{
	key: string;
}

export interface UniqueSymbolTypeMetadata extends TypeMetadata
{
	key?: string;
}

export interface UnionOrIntersectionTypeMetadata extends TypeMetadata
{
	types?: Array<TypeReference>;
}

export interface UnionTypeMetadata extends UnionOrIntersectionTypeMetadata
{
	types?: Array<TypeReference>;
}

export interface EnumTypeMetadata extends TypeMetadata
{
	entries: { [key: string]: number | string };
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