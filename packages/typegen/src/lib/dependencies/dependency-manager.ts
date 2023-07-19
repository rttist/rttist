import { Config } from "../config/config";
import { DependencyInfo } from "../../declarations/dependency-info";

export class DependencyManager {
	public readonly dependencies?: DependencyInfo[];

	constructor(config: Config) {
		this.dependencies = config.dependenciesInfo;
	}

	public getDependencyInfo(fileName: string): DependencyInfo | undefined {
		return this.dependencies?.find((dep) => dep.pathRegex.test(fileName));
	}

	// public async loadDependencies(): Promise<DependencyInfo[]> {
	// 	const dependenciesInfo: DependencyInfo[] = [];
	// 	const dependencies = Object.keys(this.config.packageInfo.packageJson.dependencies ?? {}).concat(
	// 		Object.keys(this.config.packageInfo.packageJson.devDependencies ?? [])
	// 	);
	// 	const promises = [];
	//
	// 	for (const packageName of dependencies) {
	// 		const joinedPath = resolvePath(this.config.packageInfo.packageRoot, "node_modules", packageName);
	//
	// 		promises.push(
	// 			new Promise(async (resolve, reject) => {
	// 				try {
	// 					// Resolves realpath - removing symlinks.
	// 					const realDirPath = normalizePath(await fs.realpath(joinedPath));
	//
	// 					const dependencyInfo: DependencyInfo = {
	// 						packageName,
	// 						packageRoot: realDirPath,
	// 						pathRegex: new RegExp("^" + realDirPath),
	// 						metadataPath: undefined,
	// 					};
	//
	// 					const packageJson = await this.readPackageJson(joinedPath, packageName);
	//
	// 					if (packageJson.reflection) {
	// 						if (packageJson.reflection.metadata) {
	// 							dependencyInfo.metadataPath = normalizePath(
	// 								joinPaths(dependencyInfo.packageRoot, packageJson.reflection.metadata)
	// 							);
	// 						}
	// 					}
	//
	// 					dependenciesInfo.push(dependencyInfo);
	// 				} catch (e) {
	// 					this.logger.warn(
	// 						`Unable to read package.json of package '${packageName}'\n\t${joinedPath}\n\t`,
	// 						e
	// 					);
	// 				}
	// 			})
	// 		);
	// 	}
	//
	// 	await Promise.all(promises);
	//
	// 	return dependenciesInfo;
	// }
	//
	// private async readPackageJson(joinedPath: string, packageName: any): Promise<PackageJson> {
	// 	const packageJsonPath = path.join(joinedPath, "package.json");
	//
	// 	try {
	// 		const packageJson = await fs.readFile(packageJsonPath, { encoding: "utf-8" });
	// 		return JSON.parse(packageJson) as PackageJson;
	// 	} catch (e) {
	// 		this.logger.warn(`Unable to read package.json of package '${packageName}'\n\t${packageJsonPath}\n\t`, e);
	// 	}
	//
	// 	return {};
	// }
}
