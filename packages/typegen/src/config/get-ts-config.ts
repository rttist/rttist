import * as ts from "typescript";
import { CommandLineArguments } from "../declarations/command-line-arguments";
import { resolvePath } from "../utils/path";

export function getTsConfig(cliArgs: CommandLineArguments): ts.ParsedCommandLine {
	const config = ts.getParsedCommandLineOfConfigFile(
		resolvePath(cliArgs.projectRoot, "tsconfig.json"),
		{},
		ts.sys as unknown as ts.ParseConfigFileHost
	);

	if (!config) {
		throw new Error("Could not read a valid 'tsconfig.json'.");
	}

	return config;

	// const configPath = ts.findConfigFile(
	// 	"./",
	// 	ts.sys.fileExists,
	// 	"tsconfig.json"
	// );
	//
	// if (!configPath)
	// {
	// 	throw new Error("Could not find a valid 'tsconfig.json'.");
	// }
	//
	// const configJson = readJsonAndFollowExtend(configPath);
	// ts.parseJsonConfigFileContent()
	// const convertResult = ts.convertCompilerOptionsFromJson(configJson.compilerOptions, "");
	//
	// if (convertResult.errors.length > 0)
	// {
	// 	throw new Error(`Could not parse tsconfig file '${configPath}'.`);
	// }
	//
	// return convertResult.options;
}

// function readJsonAndFollowExtend(
// 	configPath: string
// ): { [key: string]: any } & { compilerOptions?: { [key: string]: any } } {
// 	const config = ts.readConfigFile(configPath, ts.sys.readFile).config;
//
// 	if (!config) {
// 		throw new Error(`Could not read tsconfig file '${configPath}'.`);
// 	}
//
// 	if (config.extends) {
// 		const parentConfigPath = resolvePath(dirname(configPath), config.extends);
// 		const parentConfig = readJsonAndFollowExtend(parentConfigPath);
//
// 		return {
// 			...parentConfig,
// 			...config,
// 			compilerOptions: {
// 				...parentConfig.compilerOptions,
// 				...config.compilerOptions,
// 			},
// 		};
// 	}
//
// 	return config;
// }
