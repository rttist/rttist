export const lazyTypescript = {
	get() {
		return require("typescript") as typeof import("typescript");
		// return require("typescript") as typeof import("typescript");
	},
};
