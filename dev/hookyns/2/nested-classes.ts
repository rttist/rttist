import { route } from "./framework/controllers/decorators/route";

export const MainConst = class {
	prop: typeof route;
	prop2: boolean;

	static readonly StaticFiled = class ClassUnderStaticFiled {
		prop: number;

		constructor() {
			console.log(ClassUnderStaticFiled, MainConst.StaticFiled);
		}
	};
};
