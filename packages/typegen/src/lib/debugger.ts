import type * as ts from "typescript";

declare global {
	export class TypegenDebugger {
		static visitingNode?: ts.Node;
		static generatingIdFor?: ts.Node;
	}
}

(globalThis as any).TypegenDebugger = class TypegenDebugger {
	static visitingNode?: ts.Node;
	static generatingIdFor?: ts.Node;
};
