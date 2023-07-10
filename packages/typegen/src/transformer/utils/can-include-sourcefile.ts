import * as micromatch from "micromatch";
import type { Config } from "../../config/config";

// TODO: This is probably irrelevant, because we process only files which should be included.

export function canIncludeSourceFile(filename: string, config: Config) {
	let include = false;

	for (const pattern of config.include) {
		// if (regex.test(filename))
		if (micromatch.isMatch(filename, pattern)) {
			// TODO: Performance?
			include = true;
			break;
		}
	}

	if (!include) {
		return false;
	}

	for (const pattern of config.exclude) {
		if (micromatch.isMatch(filename, pattern)) {
			return false;
		}
	}

	return true;
}
