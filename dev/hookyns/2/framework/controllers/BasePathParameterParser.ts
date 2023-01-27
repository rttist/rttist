import { Type }                 from "rttist";
import { IPathParameterParser } from "./IPathParameterParser";

export class BasePathParameterParser implements IPathParameterParser
{
	parse(value: string | undefined, type: Type): any
	{
		if (value === undefined)
		{
			return undefined;
		}

		if (type.is(Type.String))
		{
			return value.toString();
		}

		if (type.is(Type.Number))
		{
			return parseFloat(value);
		}

		if (type.is(Type.Boolean))
		{
			return value.toLowerCase() === true.toString();
		}

		if (type.is(Type.Date))
		{
			return Date.parse(value);
		}

		console.warn(`Unsupported action path parameter type '${type.toString()}'.`);
		return value;
	}
}