/**
 * Kind of type
 */
export enum TypeKind
{
	Object,
	Interface,
	Class,
	TypeParameter,
	Alias,
	ConditionalType,
	IndexedAccess,
	Module,
	Union,
	Intersection,
	Method,
	Function,
	GeneratorFunction,
	Any,
	Unknown,
	Never,
	Undefined,
	Null,
	Void,
	String,
	Number,
	BigInt,
	Boolean,
	True,
	False,
	Enum,
	StringLiteral,
	NumberLiteral,
	BigIntLiteral,
	BooleanLiteral,
	EnumLiteral,
	TemplateLiteral,
	Date,
	Array,
	Tuple,
	Map,
	WeakMap,
	Set,
	WeakSet,
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
	Symbol,
	UniqueSymbol,
	Promise,
	Error,
	RegExp,
	RegExpLiteral,
	ArrayBuffer,
	SharedArrayBuffer,
	Atomics,
	DataView,
	Generator,
	AsyncGenerator,
	Iterator,
	Iterable,
	IterableIterator,
	AsyncIterator,
	AsyncIterable,
	AsyncIterableIterator,
	Proxy,
	Jsx,
	
	ArrayDefinition,
	ReadonlyArrayDefinition,
	// TupleDefinition,
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

	// Keep last
	Invalid,
}

export type NativeTypeKind =
	TypeKind.Any
	| TypeKind.Unknown
	| TypeKind.Void
	| TypeKind.Never
	| TypeKind.Null
	| TypeKind.Undefined
	| TypeKind.Object
	| TypeKind.String
	| TypeKind.Number
	| TypeKind.BigInt
	| TypeKind.Boolean
	| TypeKind.True
	| TypeKind.False
	| TypeKind.Date
	| TypeKind.Error
	| TypeKind.Symbol
	| TypeKind.UniqueSymbol
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
	;

// TODO: Add generic type definitions Array, Set, Map, WeakSet, WeakMap etc. 
//  all the generic types must have base generic type definition so it will be possible to compare them.