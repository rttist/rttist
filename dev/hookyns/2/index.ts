import { Type } from "rttist";

// console.log(Reflect.getType<number>().name);
//
//
function fn1<TType>(t: TType) {
	return Reflect.getType<TType>();
}

function fn2<UType, TType>(...t: TType[]) {
	return fn1(t[0]);
}

const a = ["a", "b"];

const reg = /[a-z]/;

console.log(fn1(reg).id);
console.log(fn1("").id);
console.log(fn1(3).id);
console.log(fn1(9007199254740454498794654991n).id);
console.log(fn2<true, string>(...a).id);
const x: Type = fn2<object, number>(5);
console.log(x.id);
//
// class Foo {
// 	name = "Foo";
//
// 	bar<T>() {
// 		return this.name;
// 	}
// }
//
// const f = new Foo();
// f.bar<string>();