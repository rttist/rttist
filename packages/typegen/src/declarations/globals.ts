declare global {
	namespace performance {
		export function now(): number;
	}
	namespace WebAssembly {
		interface Module {}
	}

	interface SymbolConstructor
	{
		readonly dispose: unique symbol;
	}
}