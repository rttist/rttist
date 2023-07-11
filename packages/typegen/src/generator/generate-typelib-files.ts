import * as fs from "fs/promises";
import { Config } from "../config/config";
import { resolvePath } from "../utils/path";

export async function generateTypelibFiles(allFiles: string[], config: Config) {
	await generateIndexFile(config, allFiles);
	await generateTypelib(config, "metadata.typelib.ts", false);
	await generateTypelib(config, "public.typelib.ts", true);
}

async function generateIndexFile(config: Config, allFiles: string[]) {
	await fs.writeFile(
		resolvePath(config.cacheDir, "metadata.index.ts"),
		`${allFiles.map((file, index) => `import * as $${index} from "./${file}";`).join("\n")}
export const metadataCollection = [${allFiles.map((_, index) => `$${index}`).join(",")}];`,
		"utf-8"
	);
}

async function generateTypelib(config: Config, typelibFileName: string, stripInternals: boolean) {
	await fs.writeFile(
		resolvePath(config.cacheDir, typelibFileName),
		`import { MetadataLibrary } from "rttist";
import { metadataCollection } from "./metadata.index";
const Metadata = new MetadataLibrary();
metadataCollection.forEach((mod) => mod.add(Metadata, ${stripInternals ? "true" : "false"}));
export { Metadata };`,
		"utf-8"
	);
}
