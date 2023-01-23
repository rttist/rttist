import { Config } from "../config/Config";

export function canIncludeSourceFile(filename: string, config: Config)
{
	let include = false;

	for (const regex of config.include)
	{
		if (regex.test(filename))
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
		if (regex.test(filename))
		{
			return false;
		}
	}
	
	return true;
}