import { Program } from "./program";
import { CLI } from "./cli";

const cli = new CLI();
const program = new Program(cli);

program
	.run()
	.then(() => {
		console.log("Program finished");
	})
	.catch((error) => {
		console.error("Program failed.", error);
	});
