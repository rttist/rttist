import { TypeIndex } from "./type-index";

export type DependencyInfo = {
	packageName: string;
	packageRoot: string;
	pathRegex: RegExp;
	typeIndex: TypeIndex;
	typelibPath?: string;
};
