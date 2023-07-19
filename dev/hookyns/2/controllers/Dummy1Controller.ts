import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";
import { MainConst } from "../nested-classes";

@route("/dummy11")
export class Dummy1Controller implements IController {
	static readonly field: IController;
	static readonly field2: typeof MainConst.StaticFiled;

	get() {
		return {};
	}
}

class Foo<T> {
	static readonly prop: number;
	promise: Promise<boolean>;
	regex = /sss/;
	date = new Date();
	dateOptional?: Date;
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
	stringLiteral: "foo" | "bar" | "baz";
	numberLiteral: 1 | 2 | 3;
	booleanLiteral: true | false;

	private *generator() {
		return 0;
	}

	private async *asyncGenerator() {
		return 0;
	}

	function: Function;

	constructor(bar: T);
	constructor(bar: T, foo: string);
	constructor(t: T, foo: string, bar: number, baz: boolean);
	constructor(bar: T, ...rest: any[]) {
		// Reflect.getType<T>();
	}

	doSomething<U>() {
		// console.log("Foo::T", Reflect.getType<T>().toString());
		// console.log("Foo.doSomething::U", Reflect.getType<U>().toString());
	}
}
