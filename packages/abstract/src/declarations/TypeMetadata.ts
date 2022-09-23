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
	constraint?: TypeReference;
	default?: TypeReference;
}

export interface ClassTypeMetadata extends ExtendableObjectLikeBaseTypeMetadata
{
	ctor?: AsyncCtorReference;
	ctorSync?: SyncCtorReference;
	constructors: ReadonlyArray<Signature>;
	interface?: TypeReference;
	decorators: ReadonlyArray<DecoratorInfo>;
	abstract?: boolean;
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