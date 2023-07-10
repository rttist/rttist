import * as fs from "fs/promises";
import { Config } from "../config/config";
import { resolvePath } from "../utils/path";

export async function generateTypelibFiles(allFiles: string[], config: Config) {
	await fs.writeFile(
		resolvePath(config.cacheDir, "metadata.typelib.ts"),
		`import { MetadataLibrary } from "rttist";
${allFiles.map((file, index) => `import * as $${index} from "./${file}";`).join("\n")}

const m = new MetadataLibrary();
const s = false; // stripInternals
${allFiles.map((_, index) => `$${index}.add(m,s);`).join("\n")}
export const Metadata = m`,
		"utf-8"
	);
}
