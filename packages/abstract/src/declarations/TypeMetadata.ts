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

export interface ObjectTypeMetadata extends ObjectLikeBaseTypeMetadata
{
	kind: TypeKind.Object;
}

export interface TypeParameterTypeMetadata extends TypeMetadata
{
	kind: TypeKind.TypeParameter;
	constraint?: TypeReference;
	default?: TypeReference;
}

export interface ClassTypeMetadata extends ObjectLikeBaseTypeMetadata
{
	kind: TypeKind.Class;
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
	kind: TypeKind.Interface;
	extends?: TypeReference[];
}

export interface TypeAliasTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Alias;
	target: TypeReference;
}

export interface ESSymbolTypeMetadata extends TypeMetadata
{
	kind: TypeKind.ESSymbol;
	key: string;
}

export interface UniqueSymbolTypeMetadata extends TypeMetadata
{
	kind: TypeKind.UniqueSymbol;
	key?: string;
}

export interface UnionOrIntersectionTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Union | TypeKind.Intersection;
	types?: Array<TypeReference>;
}

export interface UnionTypeMetadata extends UnionOrIntersectionTypeMetadata
{
	kind: TypeKind.Union;
	types?: Array<TypeReference>;
}

export interface IntersectionTypeMetadata extends UnionOrIntersectionTypeMetadata
{
	kind: TypeKind.Intersection;
	types?: Array<TypeReference>;
}

export interface EnumTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Enum;
	entries: { [key: string]: number | string };
}

export interface EnumLiteralTypeMetadata extends TypeMetadata
{
	kind: TypeKind.EnumLiteral;
	value?: any;
	enum: TypeReference;
}

export interface LiteralTypeMetadata extends TypeMetadata
{
	kind: TypeKind.NumberLiteral
		| TypeKind.StringLiteral
		| TypeKind.BigIntLiteral
		| TypeKind.RegExpLiteral;
	value?: any;
}

export interface TemplateTypeMetadata extends TypeMetadata
{
	kind: TypeKind.TemplateLiteral;
	head: string;
	templateSpans: Array<{ expression: string, literal: string }>;
}

export interface ConditionalTypeMetadata extends TypeMetadata
{
	kind: TypeKind.ConditionalType;
	extends: TypeReference;
	trueType: TypeReference;
	falseType: TypeReference;
}

export interface FunctionTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Function;
	signatures: Signature[];
}

export interface GeneratorFunctionTypeMetadata extends TypeMetadata
{
	kind: TypeKind.GeneratorFunction;
	signatures: Signature[];
}

// export interface MethodTypeMetadata
// {	
// 	kind: TypeKind.Method;
// 	owner: TypeReference;
// 	member: MemberNameMetadata;
// 	nullable?: boolean;
// }

export interface IndexedAccessTypeMetadata extends TypeMetadata
{
	kind: TypeKind.IndexedAccess;
	objectType: TypeReference;
	indexType: TypeReference;
}

export interface ArrayTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Array;
}

export interface ReadonlyArrayTypeMetadata extends TypeMetadata
{
	kind: TypeKind.ReadonlyArray;
}

export interface TupleTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Tuple;
}

export interface SetTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Set;
}

export interface WeakSetTypeMetadata extends TypeMetadata
{
	kind: TypeKind.WeakSet;
}

export interface MapTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Map;
}

export interface WeakMapTypeMetadata extends TypeMetadata
{
	kind: TypeKind.WeakMap;
}

export interface PromiseTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Promise;
}

export interface NamespaceTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Namespace;
}

export interface ModuleTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Module;
}

export type AnyTypeMetadata = //TypeMetadata 
	TypeAliasTypeMetadata
	| InterfaceTypeMetadata
	| ObjectTypeMetadata
	| ClassTypeMetadata
	| LiteralTypeMetadata
	| TemplateTypeMetadata
	| EnumLiteralTypeMetadata
	| TypeParameterTypeMetadata
	| ESSymbolTypeMetadata
	| UniqueSymbolTypeMetadata
	| UnionTypeMetadata
	| IntersectionTypeMetadata
	| EnumTypeMetadata
	| ConditionalTypeMetadata
	| FunctionTypeMetadata
	| GeneratorFunctionTypeMetadata
	| IndexedAccessTypeMetadata
	| ArrayTypeMetadata
	| ReadonlyArrayTypeMetadata
	| TupleTypeMetadata
	| SetTypeMetadata
	| WeakSetTypeMetadata
	| MapTypeMetadata
	| WeakMapTypeMetadata
	| PromiseTypeMetadata
	| NamespaceTypeMetadata
	| ModuleTypeMetadata
	;