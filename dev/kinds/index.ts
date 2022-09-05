import {
	Type,
	TypeKind
}                  from "@rtti/abstract";

Reflect.getType<{ foo: string, bar: number }>();

interface ISomething
{
	property: string;
	optionalProperty?: string;
	readonly readOnlyProperty: string;

	get getter(): string;

	set setter(val: string);

	method(): string;

	optionalMethod?(): string;
}

// Interface
Reflect.getType<ISomething>();

function decorator(target: any)
{
}


@decorator
class Something implements ISomething
{
	property: string;
	optionalProperty?: string;
	readonly readOnlyProperty: string;

	get getter(): string
	{
		return "";
	}

	set setter(val: string)
	{
	}

	method(): string
	{
		return "";
	}

	optionalMethod?(): string;
}

// CLass
Reflect.getType<Something>();

// TransientTypeReference
Reflect.getType<Readonly<{ foo: string }>>();
Reflect.getType<Partial<{ foo: string }>>();

// Tuple
Reflect.getType<[named: string, tuple: string]>();
Reflect.getType<[string, number]>();

// TypeParameter
class GenericType<T>
{
	foo: T;
}

Reflect.getType<GenericType<string>>(); // Class will have the TypeParameter

// ConditionalType
interface ConditionalType
{
	method<T>(): T extends string ? never : number;
}

Reflect.getType<ConditionalType>(); // Method has ConditionalType return type

// IndexedAccess
interface IndexedAccess
{
	method<K extends keyof TypeKind>(key: K): TypeKind[K];
}

Reflect.getType<IndexedAccess>();

// Module
module Mod
{
	export function foo()
	{
	}
}
namespace Ns
{
	function foo()
	{
	}
}
Reflect.getType<typeof Mod>();
Reflect.getType<typeof Ns>();

// Union
Reflect.getType<string | number>();

// Intersection
console.log("intersection");
Reflect.getType<{ foo: string } & { foo: string, bar: number }>();

// Method
Reflect.getType<IndexedAccess["method"]>();

// Function
const fn = function (a: any) {
};
Reflect.getType<typeof fn>();

// GeneratorFunction
const genFn = function* (a: any) {
};
Reflect.getType<typeof genFn>();

// Enum
enum Enm
{
	One, Two
}

Reflect.getType<Enm>();

// Enum literal
Reflect.getType<Enm.One>();

Reflect.getType<any>();
Reflect.getType<unknown>();
Reflect.getType<undefined>();
Reflect.getType<null>();
Reflect.getType<void>();

Reflect.getType<string>();
Reflect.getType<number>();
Reflect.getType<BigInt>();
Reflect.getType<Boolean>();
Reflect.getType<Date>();

Reflect.getType<Array<number>>();
Reflect.getType<number[]>();

Reflect.getType<Map<string, string>>();
Reflect.getType<WeakMap<Function, string>>();
Reflect.getType<Set<string>>();
Reflect.getType<WeakSet<Function>>();

Reflect.getType<Int8Array>();
Reflect.getType<Uint8Array>();
Reflect.getType<Uint8ClampedArray>();
Reflect.getType<Int16Array>();
Reflect.getType<Uint16Array>();
Reflect.getType<Int32Array>();
Reflect.getType<Uint32Array>();
Reflect.getType<Float32Array>();
Reflect.getType<Float64Array>();
Reflect.getType<BigInt64Array>();
Reflect.getType<BigUint64Array>();

Reflect.getType<Symbol>();
Reflect.getType<Promise<boolean>>();
Reflect.getType<Error>();
Reflect.getType<RegExp>();

Reflect.getType<ArrayBuffer>();
Reflect.getType<SharedArrayBuffer>();
Reflect.getType<Atomics>();
Reflect.getType<DataView>();
Reflect.getType<Generator>();

// Proxy TODO: Probably will not work, typeof proxy object is type of that object, proxy is not a type
const proxy = new Proxy({}, {});
Reflect.getType<typeof proxy>();

const regexLiteral = /[a-b]/;
Reflect.getType<typeof regexLiteral>();

Reflect.getType<5>();
Reflect.getType<"string">();
Reflect.getType<true>();
const bigint = BigInt(5);
Reflect.getType<typeof bigint>();
Reflect.getType<`Some bigint ${bigint} here`>();
