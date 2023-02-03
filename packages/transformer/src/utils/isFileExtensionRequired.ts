import { TransformerContext } from "../contexts/TransformerContext";
import ts                     from "typescript";

/**
 * Return TRUE whenever file extension is required for an import.
 */
export function isFileExtensionRequired()
{
	return TransformerContext.instance.config.moduleResolution === ts.ModuleResolutionKind.Node16
		|| TransformerContext.instance.config.moduleResolution === ts.ModuleResolutionKind.NodeNext;
}