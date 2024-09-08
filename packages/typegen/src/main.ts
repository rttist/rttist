import { MetadataLibrary } from "rttist";
import { getParsedConfig } from "./lib/config/config";
import { Logger } from "./lib/logging";

export async function generateMetadata(): MetadataLibrary {
	const config = await getParsedConfig(this.cli.getCommandLineArguments());
	Logger.setLevel(config.logLevel);
}
