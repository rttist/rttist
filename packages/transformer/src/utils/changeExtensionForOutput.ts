import path                   from "path";
import ts                     from "typescript";
import { TransformerContext } from "../contexts/TransformerContext";
import { removeExtensions }   from "./removeExtensions";

export function changeExtensionForOutput(sourceFilePath: string): string
{
	const filePath = removeExtensions(sourceFilePath);

	if (TransformerContext.instance.config.moduleResolution === ts.ModuleResolutionKind.Node16
		|| TransformerContext.instance.config.moduleResolution === ts.ModuleResolutionKind.NodeNext)
	{
		const ext = path.extname(sourceFilePath);

		if (ext === ".ts")
		{
			return filePath + ".js";
		}

		if (ext === ".tsx")
		{
			return filePath + ".jsx";
		}

		if (ext === ".mts")
		{
			return filePath + ".mjs";
		}
	}
	
	return filePath;
}