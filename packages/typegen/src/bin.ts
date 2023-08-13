import { Program } from "./program";
import { CLI } from "./cli";

const cli = new CLI();
const program = new Program(cli);

program
	.run()
	.catch(async (error: any) => {
		console.error("Program failed.", error);

		// TODO: Use it in finally block
		try {
			(await import("memory-mapped-files")).stopCacheServer();
		} catch (e) {}
	})
	.finally(() => {
		// TODO: Keep it in finally; but it logs .NET exception
		// try {
		// 	require("memory-mapped-files").stopCacheServer();
		// } catch (e) {}
	});
