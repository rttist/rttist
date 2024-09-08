import { getType } from "../metadata.typelib";

class Foo {
	bar: string;
	baz: number;

	constructor(bar: string, baz: number) {
		this.bar = bar;
		this.baz = baz;
	}
}

console.log("Nested type:", getType<Foo>().id);
