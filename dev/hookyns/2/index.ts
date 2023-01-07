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
function decorate(target: Function) {
	console.log("Type from within class decorator:", Reflect.getType(target).toString());
}

function decorateProp(target: any, prop: string) {
	const type = Reflect.getType(target);
	console.log(`Type of property '${type.name}.${prop}' from within property decorator:`, type.isClass() ? type.getProperty(prop).type.toString() : Type.Invalid);
}

@decorate
class Foo<U = void> {
	@decorateProp
	name = "Foo";
	
	Child = class {
		childBar<T>() {
			return [Reflect.getType<T>(), Reflect.getType<U>()];
		}
	}

	constructor(..._: U extends void ? ["You have to set Type Parameter"] : [])
	{
		console.log("Instantiating class with type parameter U:", Reflect.getType<U>().toString(), "new.target:", new.target);
	}

	bar<T>() {
		if (this.name !== "Foo") {
			throw new Error("Name in Foo is not 'Foo'!");
		}

		return [Reflect.getType<T>(), Reflect.getType<U>()];
	}
}

const f = new Foo<number>();
console.log("f instanceof Foo:", f instanceof Foo, "constructor:", f.constructor, Object.getPrototypeOf(f).constructor);
console.log("f", f.bar<string>()[0].toString(), f.bar<string>()[1].toString());

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