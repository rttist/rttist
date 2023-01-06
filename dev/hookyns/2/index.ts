import { Type } from "rttist";

// FUNCTIONS ----------------
function fn1<TType>(t: TType) {
	return Rttist.getType<TType>();
}

const fn2 = function<UType, TType>(t: TType) {
	return fn1(t);
}

console.log(fn2("ff").toString());
console.log(fn1<boolean>(null as any).toString());

// CLASS ----------------
class Foo<U = void> {
	name = "Foo";

	constructor(..._: U extends void ? ["You have to set Type Parameter"] : [])
	{
	}

	bar<T>() {
		if (this.name !== "Foo") {
			throw new Error("Name in Foo is not 'Foo'!");
		}

		return [Reflect.getType<T>(), Reflect.getType<U>()];
	}
}
//
// const f = new Foo<number>();
// console.log("f", f.bar<string>()[0].name, f.bar<string>()[1].name);
//
// OBJECTS ----------------
const b = {
	name: "Bar",

	bar<T>() {
		if (this.name !== "Bar") {
			throw new Error("Name in b.bar is not 'Bar'!");
		}

		return Reflect.getType<T>();
	}
}

console.log("b", b.bar<string>().toString());