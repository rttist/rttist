export const lazyTypescript = {
	/**
	 * @return import("typescript")
	 */
	get() {
		return require("typescript") as typeof import("typescript");
		// return require("typescript") as typeof import("typescript");
	},
};
