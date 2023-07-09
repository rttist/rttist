import { PackageJson } from "./package-json";

/**
 * Package information.
 * @internal
 */
export type PackageInfo = {
	packageRoot: string;
	name: string;
	packageJson: PackageJson;
};
