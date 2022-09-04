import "@rtti/abstract";
import { SomeType } from "./SomeType";

Reflect.getType<number>();

type Obj = { foo: string, bar: Obj };
type ObjAlias = Obj;
Reflect.getType<Obj>();
Reflect.getType<Obj>();
Reflect.getType<ObjAlias>();
Reflect.getType<{ foo: string, bar: number }>();
Reflect.getType<SomeType>();


class Foo<T>
{
	constructor(bar: T, ...rest: any[]) {
		Reflect.getType<T>();
	}

	doSomething<U>() {
		Reflect.getType<T>();
		Reflect.getType<U>();
	}
}

Reflect.construct(Foo, [])

// new,
new Foo<string>("bar").doSomething();

// or Reflect.construct<T>(Function, args: any[], newTarget: Function),
Reflect.construct<Foo<string>>(Foo, ["some", "args"]).doSomething();

// or Reflect.construct(Function, typeArgs: Type[], args: any[], newTarget: Function),
Reflect.constructGeneric(Foo, [Reflect.getType<string>()], ["some", "args"]).doSomething();

// or this too.
function baz<T>(Ctor: Function, ...args: any[]): any {
	return Reflect.constructGeneric(Ctor, [Reflect.getType<T>()], args);
}

(baz<string>(Foo, "some", "args") as Foo<string>).doSomething();