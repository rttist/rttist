// import type { AnyTypeMetadata } from "../declarations";
// import { TypeKind }             from "../enums";
// import { Type }                 from "../Type";
// import {
// 	ArrayType,
// 	ClassType,
// 	ConditionalType,
// 	EnumLiteralType,
// 	EnumType,
// 	ESSymbolType,
// 	FunctionType,
// 	GeneratorFunctionType,
// 	IndexedAccessType,
// 	InterfaceType,
// 	IntersectionType,
// 	LiteralType,
// 	MapType,
// 	ModuleType,
// 	NamespaceType,
// 	NumberLiteralType,
// 	ObjectType,
// 	PromiseType,
// 	ReadonlyArrayType,
// 	SetType,
// 	TemplateType,
// 	TupleType,
// 	TypeAliasType,
// 	TypeParameterType,
// 	UnionType,
// 	UniqueSymbolType,
// 	WeakMapType,
// 	WeakSetType
// }                               from "../types";
//
// type TypeKindToTypeMap = {
// 	[TypeKind.NumberLiteral]: NumberLiteralType;
// 	[TypeKind.BigIntLiteral]: NumberLiteralType;
// 	[TypeKind.StringLiteral]: NumberLiteralType;
// 	[TypeKind.RegExpLiteral]: NumberLiteralType;
// 	[TypeKind.TemplateLiteral]: TemplateType;
// 	[TypeKind.UniqueSymbol]: UniqueSymbolType;
// 	[TypeKind.ESSymbol]: ESSymbolType;
// 	[TypeKind.Object]: ObjectType;
// 	[TypeKind.Interface]: InterfaceType;
// 	[TypeKind.Class]: ClassType;
// 	// [TypeKind.NumberLiteral]: NumberLiteralType;
// }
//
// // export function createType<TMetadata extends AnyTypeMetadata>(metadata: TMetadata):
// // 	TMetadata extends { kind: infer TKind }
// // 		? TKind extends TypeKind.NumberLiteral | TypeKind.BigIntLiteral | TypeKind.StringLiteral | TypeKind.RegExpLiteral
// // 			? LiteralType
// // 			: TKind extends TypeKind.TemplateLiteral
// // 				? TemplateType
// // 				: TKind extends TypeKind.UniqueSymbol
// // 					? UniqueSymbolType
// // 					: TKind extends TypeKind.ESSymbol
// // 						? ESSymbolType
// // 						: TKind extends TypeKind.Object
// // 							? ObjectType
// // 							: TKind extends TypeKind.Interface
// // 								? InterfaceType
// // 								: Type
// // 		: never
//
// // export function createType<TTypeKind extends TypeKind>(metadata: AnyTypeMetadata & { kind: TTypeKind }):
// export function createType<TMetadata extends AnyTypeMetadata = AnyTypeMetadata>(metadata: TMetadata):
// // export function createType<TMetadata extends AnyTypeMetadata = AnyTypeMetadata>(metadata: TMetadata):
// // export function createType<TMetadata extends AnyTypeMetadata>(metadata: TMetadata):
// // TKind extends TypeKind.NumberLiteral | TypeKind.BigIntLiteral | TypeKind.StringLiteral | TypeKind.RegExpLiteral
// 	TMetadata extends { kind: infer TKind }
// 	? TKind extends keyof TypeKindToTypeMap
// 			? TypeKindToTypeMap[TKind]
// 			: Type
// 		: never
// {
// 	switch (metadata.kind)
// 	{
// 		case TypeKind.NumberLiteral:
// 		case TypeKind.BigIntLiteral:
// 		case TypeKind.StringLiteral:
// 		case TypeKind.RegExpLiteral:
// 			return new LiteralType(metadata) as any;
// 		case TypeKind.TemplateLiteral:
// 			return new TemplateType(metadata) as any;
// 		case TypeKind.UniqueSymbol:
// 			return new UniqueSymbolType(metadata);
// 		case TypeKind.ESSymbol:
// 			return new ESSymbolType(metadata);
// 		case TypeKind.Object:
// 			return new ObjectType(metadata);
// 		case TypeKind.Interface:
// 			return new InterfaceType(metadata);
// 		case TypeKind.Class:
// 			return new ClassType(metadata);
// 		case TypeKind.TypeParameter:
// 			return new TypeParameterType(metadata);
// 		case TypeKind.Alias:
// 			return new TypeAliasType(metadata);
// 		case TypeKind.ConditionalType:
// 			return new ConditionalType(metadata);
// 		case TypeKind.IndexedAccess:
// 			return new IndexedAccessType(metadata);
// 		case TypeKind.Module:
// 			return new ModuleType(metadata);
// 		case TypeKind.Namespace:
// 			return new NamespaceType(metadata);
// 		case TypeKind.Union:
// 			return new UnionType(metadata);
// 		case TypeKind.Intersection:
// 			return new IntersectionType(metadata);
// 		// case TypeKind.Method:
// 		// 	return new MethodType(); // TODO: Create. Should it be serialized on its own or should it just point to MethodInfo of an object (class/interface/object literal)/...? Does Method even exists on its own? Wouldn't it be only IndexedAccess?
// 		case TypeKind.Function:
// 			return new FunctionType(metadata);
// 		case TypeKind.GeneratorFunction:
// 			return new GeneratorFunctionType(metadata);
// 		case TypeKind.Enum:
// 			return new EnumType(metadata);
// 		case TypeKind.EnumLiteral:
// 			return new EnumLiteralType(metadata);
// 		case TypeKind.Promise:
// 			return new PromiseType([TypeKind.PromiseDefinition], metadata);
// 		case TypeKind.Array:
// 			return new ArrayType([TypeKind.ArrayDefinition], metadata);
// 		case TypeKind.ReadonlyArray:
// 			return new ReadonlyArrayType([TypeKind.ReadonlyArrayDefinition], metadata);
// 		case TypeKind.Tuple:
// 			return new TupleType([TypeKind.ArrayDefinition], metadata);
// 		case TypeKind.Map:
// 			return new MapType([TypeKind.MapDefinition], metadata);
// 		case TypeKind.WeakMap:
// 			return new WeakMapType([TypeKind.WeakMapDefinition], metadata);
// 		case TypeKind.Set:
// 			return new SetType([TypeKind.SetDefinition], metadata);
// 		case TypeKind.WeakSet:
// 			return new WeakSetType([TypeKind.WeakSetDefinition], metadata);
// 		// TODO: Create the rest
// 		// case TypeKind.Generator:
// 		// 	return new Type();
// 		// case TypeKind.AsyncGenerator:
// 		// 	return new Type();
// 		// case TypeKind.Iterator:
// 		// 	return new Type();
// 		// case TypeKind.Iterable:
// 		// 	return new Type();
// 		// case TypeKind.IterableIterator:
// 		// 	return new Type();
// 		// case TypeKind.AsyncIterator:
// 		// 	return new Type();
// 		// case TypeKind.AsyncIterable:
// 		// 	return new Type();
// 		// case TypeKind.AsyncIterableIterator:
// 		// 	return new Type();
// 		// case TypeKind.Jsx:
// 		// 	return new Type();
// 		// case TypeKind.Type:
// 		// 	return new Type();
// 		// case TypeKind.TypeCtor:
// 		// 	return new Type();
// 	}
//
// 	return Type.Invalid as any;
// }
//
// const x = createType({
// 	kind: TypeKind.Array,
// 	id: "",
// 	module: "",
// 	name: "Aha",
// });
//
// const y: LiteralType = createType({
// 	kind: TypeKind.NumberLiteral,
// 	id: "",
// 	module: "",
// 	name: "Aha",
// });
//
// const z: InterfaceType = createType({
// 	kind: TypeKind.Interface,
// 	id: "",
// 	module: "",
// 	name: "Aha",
// 	properties: [],
// 	methods: [],
// 	indexes: []
// });