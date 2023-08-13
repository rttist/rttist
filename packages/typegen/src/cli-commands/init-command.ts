import { CLI } from "../cli";
import path from "path";
import * as fs from "fs";
import { prompt, ConfirmQuestion } from "inquirer";
import { bgGray, green } from "chalk";
import { CommandLineArguments } from "../declarations/command-line-arguments";

export async function initCommand(cli: CLI) {
	const args = cli.getCommandLineArguments();

	try {
		await handleConfigFile(args);
		await handlePackageJson(args);

		console.log(green(`\u2713 Done.`));
	} catch (error: any) {
		console.error(error instanceof Error ? error.message : error);
	}
}

async function handleConfigFile(args: CommandLineArguments) {
	const configPath = path.join(args.projectRoot, "reflect.config.json");
	let writeConfig = true;

	if (fs.existsSync(configPath)) {
		const answers = (await prompt([
			{
				type: "confirm",
				name: "overwrite",
				message: `Config file ${bgGray.white("`reflect.config.json`")} already exists. Overwrite?`,
			} as ConfirmQuestion,
		])) as { overwrite: boolean };

		writeConfig = answers.overwrite;
	}

	if (!writeConfig) {
		return;
	}

	fs.writeFileSync(
		configPath,
		`{
	"$schema": "./node_modules/@rttist/typegen/config-schema.json",
	"metadata": {
		"include": [
			"src/**/*.ts"
		],
		"encode": false,
		"exclude": []
	},
	"logLevel": "Info"
}`,
		{ encoding: "utf-8" }
	);

	console.log(green(`\u2713 Config file created.`));
}

async function handlePackageJson(args: CommandLineArguments) {
	const answers = (await prompt([
		{
			type: "confirm",
			name: "patchPackageJson",
			message: `Is this project intended to be a library? (It will add a reflection section to package.json)`,
		} as ConfirmQuestion,
	])) as { patchPackageJson: boolean };

	if (!answers.patchPackageJson) {
		return;
	}

	const packageJsonPath = path.join(args.projectRoot, "package.json");

	if (!fs.existsSync(packageJsonPath)) {
		throw new Error(`package.json file does not exist in ${args.projectRoot}.`);
	}

	const packageJsonContent = fs.readFileSync(packageJsonPath, { encoding: "utf-8" });
	const indent = detectJsonIndent(packageJsonContent);
	const packageJson = JSON.parse(packageJsonContent);

	// Add the reflection section
	packageJson.reflection = {
		metadata: "dist/public.typelib.js",
	};

	if (packageJson.files) {
		packageJson.files.push("dist/public.typelib.js");
	}

	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, indent), { encoding: "utf-8" });
	console.log(green(`\u2713 Package json file patched.`));
}

function detectJsonIndent(packageJsonContent: string) {
	const match = packageJsonContent.match(/^\s*\{([\s\S]*?)\S/m);
	return match ? match[1].split("\n").pop() : "\t";
}
