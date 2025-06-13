import type { Type } from "../Type";
import type { Module } from "../Module";

export const typeSymbol = Symbol.for("rttist/Type");
export const moduleSymbol = Symbol.for("rttist/Module");

export function instanceOfType(obj: any): obj is Type {
	return obj && typeof obj === "object" && obj.constructor.__type === typeSymbol;
}

export function instanceOfModule(obj: any): obj is Module {
	return obj && typeof obj === "object" && obj.constructor.__type === moduleSymbol;
}
