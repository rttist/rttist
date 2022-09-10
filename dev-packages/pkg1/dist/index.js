"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./metadata.typelib.js");
exports.Pkg1String = "SomePkg1String";
class Pkg1Type {
	initValue;
	anyProp;
	get bar() {
		return true;
	}
	foo() {
	}
}
exports.Pkg1Type = Pkg1Type;
Pkg1Type.prototype["[[type]]"] = "@quick-tests/index.ts::Pkg1Type";