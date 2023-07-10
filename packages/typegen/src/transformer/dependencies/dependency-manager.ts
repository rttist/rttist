import * as path from "path";
import * as fs from "fs";
import { Config } from "../../config/config";
import { DependencyInfo } from "../../declarations/dependency-info";
import { PackageInfo } from "../../declarations/package-info";
import { PackageJson } from "../../declarations/package-json";
import { Logger } from "../../logging";

// TODO: DependencyManager is not required, IMHO

export class DependencyManager {
	public readonly dependencies: DependencyInfo[];
	private readonly logger = new Logger("DependencyManager");

	constructor(config: Config) {
		this.dependencies = this.loadDependencies(config.packageInfo);
	}

	public getDependencyInfo(fileName: string): DependencyInfo | undefined {
		return this.dependencies.find((dep) => dep.pathRegex.test(fileName));
	}

	private loadDependencies(packageInfo: PackageInfo): DependencyInfo[] {
		const packagesPath: DependencyInfo[] = [];
		const dependencies = Object.keys(packageInfo.packageJson.dependencies ?? {}).concat(
			Object.keys(packageInfo.packageJson.devDependencies ?? [])
		);

		for (const packageName of dependencies) {
			const joinedPath = path.resolve(packageInfo.packageRoot, "node_modules", packageName);

			try {
				// TODO: Rewrite to Promise; should be faster with a lot of dependencies.

				// Resolves realpath - removing symlinks.
				const realDirPath = fs.realpathSync(joinedPath).replace(/\\+/g, "/");

				const dependencyInfo: DependencyInfo = {
					packageName,
					packageRoot: realDirPath,
					pathRegex: new RegExp("^" + realDirPath),
					typeIndex: [], // TODO: todo
					typelibPath: undefined,
				};

				this.fetchPackageJsonOptions(joinedPath, dependencyInfo, packageName);

				packagesPath.push(dependencyInfo);
			} catch (e) {
				this.logger.warn(`Unable to read package.json of package '${packageName}'\n\t${joinedPath}\n\t`, e);
			}
		}

		return packagesPath;
	}

	private fetchPackageJsonOptions(joinedPath: string, dependencyInfo: DependencyInfo, packageName: any) {
		const packageJsonPath = path.join(joinedPath, "package.json");

		try {
			const packageJson = fs.readFileSync(packageJsonPath, { encoding: "utf-8" });
			const packageObject: PackageJson = JSON.parse(packageJson);

			if (packageObject.reflection) {
				if (packageObject.reflection.typelib) {
					dependencyInfo.typelibPath = this.getNormalizedPackageFilePath(
						packageName,
						packageObject.reflection.typelib
					);
				}

				// TODO: Maybe remove the typeIndex logic at all. We'll just match sourcefile by pattern
				//  and expect that type was generated into typelib.
				//  There can be an issue if somebody reflect some exported type of some package,
				//  but that type was excluded in that package. In such case, reference will be correct,
				//  but there will be no type in typelib.
				if (packageObject.reflection.index) {
					// const typeIndexPath = this.getNormalizedPackageFilePath(
					// 	packageName,
					// 	packageObject.reflection.index
					// );
					// dependencyInfo.typeIndex = ;
				}
			}
		} catch (e) {
			this.logger.warn(`Unable to read package.json of package '${packageName}'\n\t${packageJsonPath}\n\t`, e);
		}
	}

	private getNormalizedPackageFilePath(packageName: string, filePath: string) {
		return path.normalize(path.join(packageName, filePath)).replace(/\\+/g, "/").replace(".js", "");
	}
}
