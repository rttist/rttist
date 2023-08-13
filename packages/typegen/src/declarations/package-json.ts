/**
 * Type for `package.json` structure.
 */
export type PackageJson = {
	name?: string;
	type?: "module" | "commonjs";
	dependencies?: string[];
	devDependencies?: string[];
	reflection?: {
		metadata?: string;
	};
};
