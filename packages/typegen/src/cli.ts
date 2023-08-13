import { Command, program } from "commander";
import { CommandLineArguments } from "./declarations/command-line-arguments";
import { resolvePath } from "./lib/utils/path";
import * as fs from "fs";
import * as path from "path";
import { initCommand } from "./cli-commands/init-command";
import { generateCommand } from "./cli-commands/generate-command";

export class CLI {
	private commandOptions: object = {};

	constructor() {
		program
			.name("typegen")
			.description("RTTIST typelib generator")
			.version(this.getVersion(), "-v, --version", "Output the version number.")
			.addHelpCommand(false)
			// .addHelpCommand("help [command]", "Display help for command.")
			.helpOption("-h, --help", "Display help for command.")
			.option(
				"-p, --project <path>",
				"Path to project root directory where the reflect config and the tsconfig.json files are. Path can be absolute or relative to cwd.",
				"."
			);

		program.hook("preAction", (thisCommand, actionCommand) => {
			this.commandOptions = actionCommand.opts();
		});

		const cli = this;

		program
			.command("generate")
			.description(
				"Generate typelib, a metadata library containing metadata about types and modules in your project."
			)
			.option("-w, --watch", "enable watch mode.")
			.option("-f, --force", "force generation of all file.")
			.action(() => generateCommand(cli));

		program
			.command("init")
			.description("Create config file with recommended options and add reflection section to package.json.")
			.action(() => initCommand(cli));

		// program.option(
		// 	"--tsconfig <path>",
		// 	"path to tsconfig.json file. Can be absolute or relative to project root.",
		// 	"./tsconfig.json"
		// );

		// program.option(
		// 	"-t, --typecheck",
		// 	"enable type-checking - metadata will be more accurate but it will be much slower and it will consume much more memory."
		// );
	}

	execute() {
		program.parse();
	}

	getCommandLineArguments(): CommandLineArguments {
		const opts = Object.assign({}, program.opts(), this.commandOptions);
		const projectDir = resolvePath(process.cwd(), opts.project);

		return {
			projectRoot: projectDir,
			// config: resolvePath(dirname(tsconfigPath), opts.config),
			watch: opts?.watch ?? false,
			force: opts?.force ?? false,
			typecheck: opts?.typecheck ?? false,
		};
	}

	private getVersion() {
		const packageJson = fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf-8");
		const parsed: { version: string } = JSON.parse(packageJson);
		return parsed.version;
	}
}
