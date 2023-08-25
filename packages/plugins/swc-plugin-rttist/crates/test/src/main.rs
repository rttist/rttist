use swc_core::common::{GLOBALS};
use swc_plugin_rttist::transform;

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
getType(getType<string>());
    "#.to_string();

	let res = transform("F:/Work/sandbox/rttist-test/some-file.ts".to_string(), source);


	println!("{}", res);
}