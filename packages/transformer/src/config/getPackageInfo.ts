import fs   from "fs";
import path from "path";
import {
	PackageInfo,
	PackageJson
}           from "../declarations/general";


const UNKNOWN_PACKAGE_NAME = "@@this";

/**
 * Get name and root directory of the package.
 * @description If no package found, original root and unknown name (@@this) is returned.
 */
export function getPackageInfo(root: string, recursiveCheck: boolean = false): PackageInfo
{
	try
	{
		const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf-8");
		const parsed: PackageJson = JSON.parse(packageJson);
		return {
			packageRoot: root,
			name: parsed.name || UNKNOWN_PACKAGE_NAME,
			packageJson: parsed
		};
	}
	catch (e)
	{
		if (path.parse(root).root === root)
		{
			// as any -> internal
			return {
				packageRoot: undefined as any,
				name: UNKNOWN_PACKAGE_NAME,
				packageJson: {}
			};
		}

		// Try to get parent folder package
		const packageInfo = getPackageInfo(path.normalize(path.join(root, "..")), true);

		if (packageInfo.packageRoot === undefined)
		{
			// If this is recursive check, return undefined root as received from parent folder check
			if (recursiveCheck)
			{
				return packageInfo;
			}

			// This is top level check; return original root passed as argument
			return { packageRoot: root, name: packageInfo.name, packageJson: packageInfo.packageJson };
		}

		return packageInfo;
	}
}