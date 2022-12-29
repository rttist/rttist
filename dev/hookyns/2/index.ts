import "rttist";

function fn1<TType>(t: TType) {
	// fn1(5);
	// {
		const fn1 = true;
		return Reflect.getType<TType>();
	// }
}

function fn2<UType, TType>(...t: TType[]) {
	return fn1(t);
}

const a = ["a", "b"];

fn2("");
fn2(3);
fn2<true, string>(...a);
fn2<object, number>(5);

class Foo {
	name = "Foo";
	
	bar<T>() {
		return this.name;
	}
}

const f = new Foo();
f.bar<string>();