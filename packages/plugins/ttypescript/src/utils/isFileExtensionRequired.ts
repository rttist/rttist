import type { Config } from "../config/Config";
import ts              from "typescript";

/**
 * Return TRUE whenever file extension is required for an import.
 */
export function isFileExtensionRequired(config: Config)
{
	return config.moduleResolution === ts.ModuleResolutionKind.Node16
		|| config.moduleResolution === ts.ModuleResolutionKind.NodeNext;
}