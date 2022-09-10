import * as ts    from "typescript";
import { Config } from "../config/Config";

export function canIncludeSourceFile(sourceFile: ts.SourceFile, config: Config)
{
	let include = false;

	for (const regex of config.include)
	{
		if (regex.test(sourceFile.fileName))
		{
			include = true;
			break;
		}
	}

	if (!include)
	{
		return false;
	}

	for (const regex of config.exclude)
	{
		if (regex.test(sourceFile.fileName))
		{
			return false;
		}
	}
	
	return true;
}