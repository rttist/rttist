use swc_core::common::{GLOBALS};
use rttist_swc_transformer::transform;
use rttist_swc_transformer::types::{PackageInfo, TransformerContext};

fn main() {
    GLOBALS.set(&Default::default(), || test());
}

fn test() {
    let source = r#"
function logParameter(target: Object, propertyName: string) {
  console.log(target, propertyName);
}


function logClass(target: Function) {
  console.log(target)
}

@logClass
export class Employee {
  @logParameter
  name: string;
}

export class Foo extends Employee {
	bar: string;
	static {
		console.log(Foo);
	}
}

getType(Employee);
getType<Employee>();
getType<number>()
getType<true>()
getType<"foo">()
getType<5n>()
getType(getType<string>());

console.log(getType<Array>().name);
console.log(getType<Promise>().name);

console.log(getType<Array<string>>().name);
console.log(getType<Promise<string>>().name);
console.log(getType<ReadonlyArray<string>>().name);
console.log(getType<Set<string>>().name);
console.log(getType<WeakSet<object>>().name);
console.log(getType<Map<string, number>>().name);
console.log(getType<WeakMap<object, number>>().name);
    "#.to_string();

    let res = transform(
        "F:/Work/sandbox/rttist-test/some-file.ts".to_string(),
        source,
        TransformerContext::new(PackageInfo::new("rttist-test-pkg".to_string(), "F:/Work/sandbox/rttist-test".to_string())),
    );

    println!("{}", res);
}