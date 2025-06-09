declare global {
	namespace WebAssembly {
		interface Module {}
	}

	interface SymbolConstructor {
		readonly dispose: unique symbol;
	}
}
