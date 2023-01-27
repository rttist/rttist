import { Type } from "rttist";

export interface IPathParameterParser
{
	parse(value: any, type: Type): any;
}