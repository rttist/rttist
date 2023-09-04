import { getType } from "./metadata.typelib";

export class Foo {
	bar: string;
	baz: number;

	constructor(bar: string, baz: number) {
		this.bar = bar;
		this.baz = baz;
	}
}

const foo = new Foo("", 5);

console.log(foo);
console.log(getType<Foo>().id);
console.log(getType(Foo).id);
