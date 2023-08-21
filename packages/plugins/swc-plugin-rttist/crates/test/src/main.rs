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


getType(getType<string>());
    "#.to_string();

	let res = transform(source);


	println!("{}", res);
}