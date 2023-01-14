import { TypeIds } from "@rttist/core";

export function* invalidTypeGenerator()
{
	for (let i = 0; i < 100; i++)
	{
		yield TypeIds.Invalid;
	}
}