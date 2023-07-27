import { program } from "commander";
import { CommandLineArguments } from "./declarations/command-line-arguments";
import { resolvePath } from "./lib/utils/path";

export class CLI {
	constructor() {
		program.name("typegen").description("RTTIST typelib generator");

		program.option(
			"-p, --project <path>",
			"path to project root directory where the reflect config and the tsconfig.json files are. Path can be absolute or relative to cwd.",
			"."
		);

		program.option("-f, --force", "force generation of all file.");
		// program.option(
		// 	"-c, --config <path>",
		// 	"path to Rttist config file. Can be absolute or relative to tsconfig.json.",
		// 	"./reflect.config.json"
		// );
		program.option("-w, --watch", "enable watch mode.");
		program.option(
			"-t, --typecheck",
			"enable type-checking - metadata will be more accurate but it will be much slower and it will consume much more memory."
		);

		program.parse();
	}

	getCommandLineArguments(): CommandLineArguments {
		const opts = program.opts();
		const projectDir = resolvePath(process.cwd(), opts.project);

		return {
			projectRoot: projectDir,
			// config: resolvePath(dirname(tsconfigPath), opts.config),
			watch: opts?.watch ?? false,
			force: opts?.force ?? false,
			typecheck: opts?.typecheck ?? false,
		};
	}
}
