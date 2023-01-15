export function removeExtensions(sourceFilePath: string)
{
	if (sourceFilePath.slice(-5) === ".d.ts")
	{
		return sourceFilePath.slice(0, -5);
	}

	const last3 = sourceFilePath.slice(-3);

	if (last3 === ".js" || last3 === ".ts")
	{
		return sourceFilePath.slice(0, -3);
	}

	const last4 = sourceFilePath.slice(-4);

	if (last4 === ".jsx" || last4 === ".tsx"
		|| last4 === ".cjs" || last4 === ".cts"
		|| last4 === ".mjs" || last4 === ".mts"
	)
	{
		return sourceFilePath.slice(0, -4);
	}

	return sourceFilePath;
}