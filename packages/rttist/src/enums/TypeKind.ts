/**
 * Kind of type
 */
export enum TypeKind
{
	Invalid,
	Unknown,
	Any,
	Never,
	Void,
	Undefined,
	Null,
	Boolean,
	False,
	True,
	Number,
	BigInt,
	String,
	Symbol,
	NonPrimitiveObject,
	ObjectType,
	FunctionType,
	Date,
	Error,
	RegExp,
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	BigInt64Array,
	BigUint64Array,
	ArrayBuffer,
	SharedArrayBuffer,
	Atomics,
	DataView,

	ArrayDefinition,
	ReadonlyArrayDefinition,
	MapDefinition,
	WeakMapDefinition,
	SetDefinition,
	WeakSetDefinition,
	PromiseDefinition,
	GeneratorDefinition,
	AsyncGeneratorDefinition,
	IteratorDefinition,
	IterableDefinition,
	IterableIteratorDefinition,
	AsyncIteratorDefinition,
	AsyncIterableDefinition,
	AsyncIterableIteratorDefinition,
	RttistType,
	RttistModule,

	Module = 60,
	Namespace,
	Object,
	Interface,
	Class,
	Union,
	Intersection,
	ConditionalType,
	IndexedAccess,
	TypeParameter,
	Alias,
	Method,
	Function,
	GeneratorFunction,
	NumberLiteral,
	BigIntLiteral,
	StringLiteral,
	TemplateLiteral,
	EnumLiteral,
	RegExpLiteral,
	Enum,
	UniqueSymbol,
	ESSymbol,
	Promise,
	Tuple,
	Generator,
	AsyncGenerator,
	Iterator,
	Iterable,
	IterableIterator,
	AsyncIterator,
	AsyncIterable,
	AsyncIterableIterator,
	Jsx,
	//Proxy, // TODO: Proxy does not exists IMHO, only ProxyCtor - typeof Proxy

	Type, // interfaces of Function, Object,... Function and Object created as FunctionType and ObjectType
	TypeCtor, // Constructors of all native types - interfaces ArrayConstructor,...
}

export type NativeTypeKind =
	TypeKind.Any
	| TypeKind.Unknown
	| TypeKind.Void
	| TypeKind.Never
	| TypeKind.Null
	| TypeKind.Undefined
	| TypeKind.NonPrimitiveObject
	| TypeKind.String
	| TypeKind.Number
	| TypeKind.BigInt
	| TypeKind.Boolean
	| TypeKind.True
	| TypeKind.False
	| TypeKind.Date
	| TypeKind.Error
	| TypeKind.Symbol
	| TypeKind.RegExp
	| TypeKind.Int8Array
	| TypeKind.Uint8Array
	| TypeKind.Uint8ClampedArray
	| TypeKind.Int16Array
	| TypeKind.Uint16Array
	| TypeKind.Int32Array
	| TypeKind.Uint32Array
	| TypeKind.Float32Array
	| TypeKind.Float64Array
	| TypeKind.BigInt64Array
	| TypeKind.BigUint64Array
	| TypeKind.ArrayBuffer
	| TypeKind.SharedArrayBuffer
	| TypeKind.FunctionType
	| TypeKind.ObjectType
	| TypeKind.Atomics
	| TypeKind.DataView
	| TypeKind.ArrayDefinition
	| TypeKind.ReadonlyArrayDefinition
	| TypeKind.MapDefinition
	| TypeKind.WeakMapDefinition
	| TypeKind.SetDefinition
	| TypeKind.WeakSetDefinition
	| TypeKind.PromiseDefinition
	| TypeKind.GeneratorDefinition
	| TypeKind.AsyncGeneratorDefinition
	| TypeKind.IteratorDefinition
	| TypeKind.IterableDefinition
	| TypeKind.IterableIteratorDefinition
	| TypeKind.AsyncIteratorDefinition
	| TypeKind.AsyncIterableDefinition
	| TypeKind.AsyncIterableIteratorDefinition
	
	| TypeKind.RttistType
	| TypeKind.RttistModule
	
	| TypeKind.Invalid
	;

export type NonNativeTypeKind = Exclude<TypeKind, NativeTypeKind>;