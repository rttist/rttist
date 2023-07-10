import { TypeIndex } from "./TypeIndex";

export type DependencyInfo = {
	packageName: string;
	packageRoot: string;
	pathRegex: RegExp;
	typeIndex: TypeIndex;
	typelibPath?: string;
}