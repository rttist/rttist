import { TypeIds } from "@rttist/core";

export function* unknownTypeGenerator()
{
	for (let i = 0; i < 100; i++)
	{
		yield TypeIds.Invalid;
	}
}