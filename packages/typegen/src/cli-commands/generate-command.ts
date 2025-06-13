import { Program } from "../program";
import type { CLI } from "../cli";

export function generateCommand(cli: CLI) {
	const program = new Program(cli.getCommandLineArguments());

	program.run().catch(async (error: any) => {
		console.error("Program failed.", error);
	});
}
