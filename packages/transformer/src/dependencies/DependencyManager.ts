import * as path              from "path";
import * as fs                from "fs";
import { TransformerContext } from "../contexts/TransformerContext";
import { PackageInfo }        from "../declarations/general";
import { log }                from "../log";
import { DependencyInfo }     from "./DependencyInfo";
import * as ts                from "typescript";

export class DependencyManager
{
	public readonly dependencies: DependencyInfo[];

	constructor(transformerContext: TransformerContext)
	{
		this.dependencies = this.loadDependencies(transformerContext.config.packageInfo);
	}

	public getDependencyInfo(fileName: string): DependencyInfo | undefined
	{
		return this.dependencies.find(dep => dep.pathRegex.test(fileName));
	}

	private loadDependencies(packageInfo: PackageInfo): DependencyInfo[]
	{
		const packagesPath: DependencyInfo[] = [];
		const dependencies = Object.keys(packageInfo.packageJson.dependencies ?? {})
			.concat(Object.keys(packageInfo.packageJson.devDependencies ?? []));

		for (const packageName of dependencies)
		{
			const joinedPath = path.resolve(packageInfo.packageRoot, "node_modules", packageName);

			try
			{
				// TODO: Rewrite to Promise; should be faster with a lot of dependencies.
				const realDirPath = fs.realpathSync(joinedPath)
					.replace(/\\+/g, "/");

				packagesPath.push({
					packageName,
					packageRoot: realDirPath,
					pathRegex: new RegExp("^" + realDirPath)
				});

				// packageJson.then(json => {
				//	
				// })
				// 	.catch(e => {
				// 		log.warn(`Unable to read package.json of package '${packageName}'\n\t${packageJsonPath}\n\t`, e);
				// 	});
			}
			catch (e)
			{
				log.warn(`Unable to read package.json of package '${packageName}'\n\t${joinedPath}\n\t`, e);
			}
		}

		return packagesPath;
	}
}