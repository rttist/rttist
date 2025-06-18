import type { Type } from "rttist";
import { getType } from "rttist/typelib";

class Foo {
	bar: string;
	baz: number;

	constructor(bar: string, baz: number) {
		this.bar = bar;
		this.baz = baz;
	}
}

const FooType: Type = getType<Foo>();
console.log("ASSERT true", "@dev-wasm-esbuild/nesting/nested-file:Foo" === FooType.id);
console.log(FooType.toString().replace(/^/gm, "\t"));
console.log("");
