import "rttist";
import { NativeTypes } from "@rttist/dev-pkg1/dist/native";
import { SomeType } from "./SomeType";

console.log("any", Reflect.getType<any>().toString());
console.log("unknown", Reflect.getType<unknown>().toString());
console.log("undefined", Reflect.getType<undefined>().toString());
console.log("null", Reflect.getType<null>().toString());
console.log("void", Reflect.getType<void>().toString());

console.log("string", Reflect.getType<string>().toString());
console.log("number", Reflect.getType<number>().toString());
console.log("boolean", Reflect.getType<boolean>().toString());
console.log("true", Reflect.getType<true>().toString());
console.log("false", Reflect.getType<false>().toString());
console.log("String", Reflect.getType<String>().toString());
console.log("Number", Reflect.getType<Number>().toString());
console.log("Boolean", Reflect.getType<Boolean>().toString());
console.log("BigInt", Reflect.getType<BigInt>().toString());
console.log("Date", Reflect.getType<Date>().toString());

console.log("Array<number>", Reflect.getType<Array<number>>().toString());
console.log("number[]", Reflect.getType<number[]>().toString());

console.log("Map<string, string>", Reflect.getType<Map<string, string>>().toString());
console.log("WeakMap<Function, string>", Reflect.getType<WeakMap<Function, string>>().toString());
console.log("Set<string>", Reflect.getType<Set<string>>().toString());
console.log("WeakSet<Function>", Reflect.getType<WeakSet<Function>>().toString());

console.log("Int8Array", Reflect.getType<Int8Array>().toString());
console.log("Uint8Array", Reflect.getType<Uint8Array>().toString());
console.log("Uint8ClampedArray", Reflect.getType<Uint8ClampedArray>().toString());
console.log("Int16Array", Reflect.getType<Int16Array>().toString());
console.log("Uint16Array", Reflect.getType<Uint16Array>().toString());
console.log("Int32Array", Reflect.getType<Int32Array>().toString());
console.log("Uint32Array", Reflect.getType<Uint32Array>().toString());
console.log("Float32Array", Reflect.getType<Float32Array>().toString());
console.log("Float64Array", Reflect.getType<Float64Array>().toString());
console.log("BigInt64Array", Reflect.getType<BigInt64Array>().toString());
console.log("BigUint64Array", Reflect.getType<BigUint64Array>().toString());

console.log("Symbol", Reflect.getType<Symbol>().toString());
console.log("symbol", Reflect.getType<symbol>().toString());
console.log("Promise<boolean>", Reflect.getType<Promise<boolean>>().toString());
console.log("Error", Reflect.getType<Error>().toString());
console.log("RegExp", Reflect.getType<RegExp>().toString());
const regex = /\s\S/;
console.log("typeof regex", Reflect.getType<typeof regex>().toString());

console.log("ArrayBuffer", Reflect.getType<ArrayBuffer>().toString());
console.log("SharedArrayBuffer", Reflect.getType<SharedArrayBuffer>().toString());
console.log("Atomics", Reflect.getType<Atomics>().toString());
console.log("DataView", Reflect.getType<DataView>().toString());
console.log("Generator", Reflect.getType<Generator>().toString());
console.log("Iterable<any>", Reflect.getType<Iterable<any>>().toString());
console.log("IterableIterator<any>", Reflect.getType<IterableIterator<any>>().toString());
console.log("AsyncIterator<any>", Reflect.getType<AsyncIterator<any>>().toString());
console.log("AsyncGenerator<any>", Reflect.getType<AsyncGenerator<any>>().toString());
console.log("AsyncGeneratorFunction", Reflect.getType<AsyncGeneratorFunction>().toString()); // TODO: Not work!

type Obj = { foo: string, bar: Obj };
type ObjAlias = Obj;
console.log("Obj", Reflect.getType<Obj>().toString());
console.log("ObjAlias", Reflect.getType<ObjAlias>().toString());
console.log("{ foo: string, bar: number }", Reflect.getType<{ foo: string, bar: number }>().toString());



console.log("SomeType", Reflect.getType<SomeType>().toString());

function genericFunction<T, U>(x: T, y: U) {

}

class Foo<T>
{
	static readonly prop: number;
	native: NativeTypes;
	promise: Promise<boolean>;
	regex = /sss/;
	date = new Date();
	symbol = Symbol();
	array: number[];
	array2: Array<string>;
	array3 = [];
	array4 = Array;
	array5: typeof Array<string>;
	readonlyArray: ReadonlyArray<string>;
	iterableIterator = [].values();
	map = new Map<string, undefined>();
	set = new Set<string>();

	private* generator()
	{
		return 0;
	}

	private async* asyncGenerator()
	{
		return 0;
	}

	function: Function;

	constructor(bar: T, ...rest: any[])
	{
		Reflect.getType<T>();
	}

	doSomething<U>()
	{
		console.log("Foo::T", Reflect.getType<T>().toString());
		console.log("Foo.doSomething::U", Reflect.getType<U>().toString());
	}
}

// Reflect.construct
const f1 = Reflect.construct(Foo, []);

// new,
const f2 = new Foo<string>("bar");
f2.doSomething();

// // or Reflect.construct<T>(Function, args: any[], newTarget: Function),
// Reflect.construct<Foo<string>>(Foo, ["some", "args"]).doSomething();
//
// // or Reflect.construct(Function, typeArgs: Type[], args: any[], newTarget: Function),
// Reflect.constructGeneric(Foo, [Reflect.getType<string>()], ["some", "args"]).doSomething();
//
// // or this too.
// function baz<T>(Ctor: Function, ...args: any[]): any
// {
// 	return Reflect.constructGeneric(Ctor, [Reflect.getType<T>()], args);
// }
//
// (baz<string>(Foo, "some", "args") as Foo<string>).doSomething();
