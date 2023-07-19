/*
	We have to generate name for every type; no matter what the exports are.
	In second step, we'll find all exports and we'll create aliases for them.
 */

export const MainConst = class ClassUnderMainConst {
	static readonly StaticFiled = class ClassUnderStaticFiled {
		constructor() {
			console.log(MainConst, ClassUnderMainConst);
			console.log(ClassUnderMainConst.StaticFiled, ClassUnderStaticFiled);
		}
	};
};

//////////////////////////////

class Foo {}

console.log(Foo);

export { Foo };

export const Types = {
	Foo,
};

//////////////////////////////

// We cannot support anything like this; It's statically impossible to determine what will be stored under Bar at runtime.
const Bar = 1 == 1 ? class {} : class {}; // In this case, 1 == 1 is const, it can be evaluated at compile time, but it may not be constant; for simplicity and performance we skip all conditionals.

//////////////////////////////
