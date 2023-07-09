/**
 * Type for `package.json` structure.
 */
export type PackageJson = {
	name?: string;
	dependencies?: string[];
	devDependencies?: string[];
	reflection?: {
		index?: string;
		typelib?: string;
	};
};
