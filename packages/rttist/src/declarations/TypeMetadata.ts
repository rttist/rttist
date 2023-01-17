import type { TypeKind } from "../enums";
import type {
	IndexFlags,
	MethodFlags,
	ParameterFlags,
	PropertyFlags,
	SymbolKind
}                        from "../enums";
import type {
	AsyncCtorReference,
	ModuleIdentifier,
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
	nullable?: boolean;
	isGenericTypeDefinition?: boolean;
	typeArguments?: TypeReference[];
	genericTypeDefinition?: TypeReference;
}

export interface ObjectLikeBaseTypeMetadata extends TypeMetadata
{
	properties: ReadonlyArray<PropertyInfoMetadata>;
	methods: ReadonlyArray<MethodInfoMetadata>;
	indexes: ReadonlyArray<IndexInfoMetadata>;
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
	constructors: ReadonlyArray<SignatureMetadataBase>;
	implements?: TypeReference[];
	decorators: ReadonlyArray<DecoratorInfoMetadata>;
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
	const: boolean;
	entries: { [key: string]: number | string };
}

export interface EnumLiteralTypeMetadata extends TypeMetadata
{
	kind: TypeKind.EnumLiteral;
	value: number | string;
	enum: TypeReference;
}

export interface LiteralTypeMetadata extends TypeMetadata
{
	kind: TypeKind.NumberLiteral
		| TypeKind.StringLiteral
		| TypeKind.BigIntLiteral
		| TypeKind.RegExpLiteral;
	value: number | string | bigint | RegExp;
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
	signatures: SignatureMetadataBase[];
}

export interface GeneratorFunctionTypeMetadata extends TypeMetadata
{
	kind: TypeKind.GeneratorFunction;
	signatures: SignatureMetadataBase[];
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

export interface TupleTypeMetadata extends TypeMetadata
{
	kind: TypeKind.Tuple;
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


export interface ParameterInfoMetadata
{
	flags: ParameterFlags;
	name: string;
	type: TypeReference;
	decorators?: DecoratorInfoMetadata[];
	initializer?: any;
}


export interface SignatureMetadataBase
{
	parameters?: Array<ParameterInfoMetadata>;
	typeParameters?: TypeReference[];
	returnType: TypeReference;
}

export interface MethodInfoMetadata
{
	flags: MethodFlags;
	name: MemberNameMetadata;
	signatures: SignatureMetadataBase[];
	decorators?: DecoratorInfoMetadata[];
}

export interface IndexInfoMetadata
{
	flags: IndexFlags;
	key: TypeReference;
	type: TypeReference;
}

export type SymbolMemberNameMetadata = { kind: SymbolKind, key: string }
export type MemberNameMetadata = string | number | SymbolMemberNameMetadata;

export interface DecoratorInfoMetadata
{
	name: string;
	id: TypeIdentifier;
	args?: Array<any>;
}

export interface PropertyInfoMetadata
{
	flags: PropertyFlags;
	name: MemberNameMetadata;
	type: TypeReference;
	decorators?: Array<DecoratorInfoMetadata>;
}


export type AnyTypeMetadata =
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
	| TupleTypeMetadata
	| PromiseTypeMetadata
	| NamespaceTypeMetadata
	| ModuleTypeMetadata
	;