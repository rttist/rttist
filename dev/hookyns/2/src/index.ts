import { Type } from "rttist";
import { Metadata, getType } from "./metadata.typelib";
// import { Application } from "./framework/Application";

// Metadata.getTypes();
//
// new Application().run({ port: 8080 }).catch((err) => {
// 	console.error(err);
// });

function httpGet(route: string) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {};
}

class Foo {
	arr: Array<string> = [];
	bar: string;
	baz: number;

	constructor(bar: string);
	constructor(bar: string, baz: number);
	constructor(bar: string, baz?: number) {
		this.bar = bar;
		this.baz = baz ?? 0;
	}

	getIndex(): object;
	getIndex(fooId: number): object;
	// @httpGet("/foo/[fooId]")
	getIndex(fooId?: number): object {
		return {};
	}
}

const t: Type = getType<Foo>();
const arr = (t.isClass() && t.getProperty("arr")?.type) as Type;

console.log(arr, arr.isArray());
console.log(t);
