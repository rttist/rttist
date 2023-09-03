const mod = require("../pkg/rttist_ts_loader_wasm.js");

// /**
//  * Loads a file from the file system and returns code compatible with the RTTIST reflection.
//  * @param path
//  */
// export function load(path: string): string {
// 	return wasmLoad(path);
// }
//
// /**
//  * Transforms the code to be compatible with the RTTIST reflection.
//  * @param code
//  * @param path
//  */
// export function transform(code: string, path: string): string {
// 	return wasmTransform(code, path);
// }

console.log(
	mod.transform(
		`function logParameter(target: Object, propertyName: string) {
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
getType(getType<string>());`,
		"F:/Work/sandbox/rttist-test/some-file.ts",
		new mod.PackageInfo("rttist-test-pkg", "F:/Work/sandbox/rttist-test")
	)
);

// console.log(load(__dirname + "\\index.js"));

// import * as fs from "fs";
// import * as path from "path";
//
// const wasmBuffer = fs.readFileSync(path.join(__dirname, "rttist_ts_loader.wasm"));
// const importObject = {
// 	env: {
// 		__memory_base: 0,
// 		__table_base: 0,
// 		memory: new WebAssembly.Memory({ initial: 1 }),
// 	},
// };
// WebAssembly.compile(wasmBuffer).then((wasmModule) => {
// 	// const { add } = wasmModule.instance.exports;
//
// 	console.log(wasmModule, wasmModule);
//
// 	WebAssembly.instantiate(wasmModule, importObject).then((instance) => {
// 		console.log(instance, instance.exports);
// 	});
// });
//
// /**
//  * Loads a file from the file system and returns code compatible with the RTTIST reflection.
//  * @param path
//  */
// export declare function load(path: string): string;
//
// /**
//  * Transforms the code to be compatible with the RTTIST reflection.
//  * @param code
//  * @param path
//  */
// export declare function transform(code: string, path: string): string;
