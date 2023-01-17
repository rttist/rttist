import type { AnyTypeMetadata } from "../declarations";
import { TypeKind }             from "../enums";
import { Type }                 from "../Type";
import {
	ArrayType,
	ClassType,
	ConditionalType,
	EnumLiteralType,
	EnumType,
	ESSymbolType,
	FunctionType,
	GeneratorFunctionType,
	IndexedAccessType,
	InterfaceType,
	IntersectionType,
	LiteralType,
	MapType,
	ModuleType,
	NamespaceType,
	ObjectType,
	PromiseType,
	ReadonlyArrayType,
	SetType,
	TemplateType,
	TupleType,
	TypeAliasType,
	TypeParameterType,
	UnionType,
	UniqueSymbolType,
	WeakMapType,
	WeakSetType
}                               from "../types";

type TypeKindToTypeMap = {
	[TypeKind.NumberLiteral]: LiteralType;
	[TypeKind.BigIntLiteral]: LiteralType;
	[TypeKind.StringLiteral]: LiteralType;
	[TypeKind.RegExpLiteral]: LiteralType;
	[TypeKind.TemplateLiteral]: TemplateType;
	[TypeKind.UniqueSymbol]: UniqueSymbolType;
	[TypeKind.ESSymbol]: ESSymbolType;
	[TypeKind.Object]: ObjectType;
	[TypeKind.Interface]: InterfaceType;
	[TypeKind.Class]: ClassType;
	[TypeKind.TypeParameter]: TypeParameterType;
	[TypeKind.Alias]: TypeAliasType;
	[TypeKind.ConditionalType]: ConditionalType;
	[TypeKind.IndexedAccess]: IndexedAccessType;
	[TypeKind.Module]: ModuleType;
	[TypeKind.Namespace]: NamespaceType;
	[TypeKind.Union]: UnionType;
	[TypeKind.Intersection]: IntersectionType;
	[TypeKind.Function]: FunctionType;
	[TypeKind.GeneratorFunction]: GeneratorFunctionType;
	[TypeKind.Enum]: EnumType;
	[TypeKind.EnumLiteral]: EnumLiteralType;
	[TypeKind.Promise]: PromiseType;
	[TypeKind.Tuple]: TupleType;
	// TODO: Add the rest
}

function createType(metadata: AnyTypeMetadata)
{
	switch (metadata.kind)
	{
		case TypeKind.NumberLiteral:
		case TypeKind.BigIntLiteral:
		case TypeKind.StringLiteral:
		case TypeKind.RegExpLiteral:
			return new LiteralType(metadata);
		case TypeKind.TemplateLiteral:
			return new TemplateType(metadata);
		case TypeKind.UniqueSymbol:
			return new UniqueSymbolType(metadata);
		case TypeKind.ESSymbol:
			return new ESSymbolType(metadata);
		case TypeKind.Object:
			return new ObjectType(metadata);
		case TypeKind.Interface:
			return new InterfaceType(metadata);
		case TypeKind.Class:
			return new ClassType(metadata);
		case TypeKind.TypeParameter:
			return new TypeParameterType(metadata);
		case TypeKind.Alias:
			return new TypeAliasType(metadata);
		case TypeKind.ConditionalType:
			return new ConditionalType(metadata);
		case TypeKind.IndexedAccess:
			return new IndexedAccessType(metadata);
		case TypeKind.Module:
			return new ModuleType(metadata);
		case TypeKind.Namespace:
			return new NamespaceType(metadata);
		case TypeKind.Union:
			return new UnionType(metadata);
		case TypeKind.Intersection:
			return new IntersectionType(metadata);
		// case TypeKind.Method:
		// 	return new MethodType(); // TODO: Create. Should it be serialized on its own or should it just point to MethodInfo of an object (class/interface/object literal)/...? Does Method even exists on its own? Wouldn't it be only IndexedAccess?
		case TypeKind.Function:
			return new FunctionType(metadata);
		case TypeKind.GeneratorFunction:
			return new GeneratorFunctionType(metadata);
		case TypeKind.Enum:
			return new EnumType(metadata);
		case TypeKind.EnumLiteral:
			return new EnumLiteralType(metadata);
		case TypeKind.Promise:
			return new PromiseType([TypeKind.PromiseDefinition], metadata);
		// TODO: Create the rest
		// case TypeKind.Generator:
		// 	return new Type();
		// case TypeKind.AsyncGenerator:
		// 	return new Type();
		// case TypeKind.Iterator:
		// 	return new Type();
		// case TypeKind.Iterable:
		// 	return new Type();
		// case TypeKind.IterableIterator:
		// 	return new Type();
		// case TypeKind.AsyncIterator:
		// 	return new Type();
		// case TypeKind.AsyncIterable:
		// 	return new Type();
		// case TypeKind.AsyncIterableIterator:
		// 	return new Type();
		// case TypeKind.Jsx:
		// 	return new Type();
		// case TypeKind.Type:
		// 	return new Type();
		// case TypeKind.TypeCtor:
		// 	return new Type();
	}

	console.warn("Creating Type of unknown TypeKind.", metadata);

	return new Type(metadata);
}

export class TypeFactory
{
	static create<TMetadata extends AnyTypeMetadata = AnyTypeMetadata>(metadata: TMetadata):
		TMetadata extends { kind: infer TKind }
			? TKind extends keyof TypeKindToTypeMap
				? TypeKindToTypeMap[TKind]
				: Type
			: never
	{
		return createType(metadata) as any;
	}
}