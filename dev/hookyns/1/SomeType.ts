export const SomeString = "SomeTypeString";

export class A<T> {
	foo: boolean;
}

export class B<T = string>
{
	A: A<T>;
}

export class SomeType<T = any> {
	SomeTypeNumber: SomeType<number>;
	A: A<T>;
	Function: typeof Function;
	Uint8Array: Uint8Array;
	ArrayBuffer: ArrayBuffer;
	SharedArrayBuffer: SharedArrayBuffer;
	Atomics: Atomics;
	DataView: DataView;
	Error: Error;
	Date: Date;
	// Proxy = Proxy;
	generator = function*() { return 5; }()
	Generator: Generator; // Has type parameters
	AsyncGenerator: AsyncGenerator; // Has type parameters
	// iterator: Iterator; // Has type parameters
	private readonly initValue: number;
	public anyProp: any;
	
	protected get bar() {
		return true;
	}
	
	foo() {
		
	}
}