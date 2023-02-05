import { isFileExtensionRequired } from "./isFileExtensionRequired";
import { removeExtension }         from "./removeExtension";

export function changeExtensionForOutput(sourceFilePath: string): string
{
	const filePath = removeExtension(sourceFilePath);

	if (isFileExtensionRequired())
	{
		let ext = sourceFilePath.slice(-3);

		if (ext === ".ts" || ext === ".js")
		{
			return filePath + ".js";
		}

		ext = sourceFilePath.slice(-4);

		if (ext === ".tsx" || ext === ".jsx")
		{
			return filePath + ".jsx";
		}

		if (ext === ".mts" || ext === ".mjs")
		{
			return filePath + ".mjs";
		}
	}

	return filePath;
}