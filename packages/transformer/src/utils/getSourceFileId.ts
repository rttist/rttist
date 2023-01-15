import { ModuleIds }                        from "@rttist/core";
import path                                 from "path";
import { ModuleIdentifier }                 from "rttist";
import * as ts                              from "typescript";
import { TransformerContext }               from "../contexts/TransformerContext";
import { ReflectedSourceFileWithReference } from "../declarations/general";
import { removeExtensions }                 from "./removeExtensions";

const PATH_SEPARATOR_REGEX = /\\/g;
const NODE_MODULES_PATTERN = "/node_modules/";
const TS_LIB_PATTERN = "/node_modules/typescript/lib/lib.";

export function getSourceFileId(sourceFile: ts.SourceFile): ModuleIdentifier
{
	if (isReflectedSourceFile(sourceFile))
	{
		return sourceFile._reflectId;
	}

	if (sourceFile.fileName.includes(TS_LIB_PATTERN))
	{
		return ModuleIds.Native;
	}

	const { packageInfo, projectDir } = TransformerContext.instance.config;
	const isExternal = TransformerContext.instance.program.isSourceFileFromExternalLibrary(sourceFile);

	if (isExternal)
	{
		const dependencyInfo = TransformerContext.instance.dependencyManager.getDependencyInfo(sourceFile.fileName);

		if (dependencyInfo !== undefined)
		{
			const sourceFileId = removeExtensions(
				"@" + dependencyInfo.packageName + sourceFile.fileName.slice(dependencyInfo.packageRoot.length)
			);
			setSourceFileReflectId(sourceFile, sourceFileId);
			return sourceFileId;
		}
	}

	const filePath = getOutPathForSourceFile(sourceFile.fileName);
	const nodeModulesIndex = filePath.lastIndexOf(NODE_MODULES_PATTERN);

	const sourceFileId = removeExtensions(
		nodeModulesIndex !== -1
			? "@" + filePath.slice(nodeModulesIndex + NODE_MODULES_PATTERN.length)
			: "@" + packageInfo.name + "/" + path.relative(projectDir, filePath).replace(PATH_SEPARATOR_REGEX, "/")
	);

	setSourceFileReflectId(sourceFile, sourceFileId);

	return sourceFileId;
}

function getOutPathForSourceFile(sourceFileName: string): string
{
	const config = TransformerContext.instance.config;

	return ts.getOutputFileNames({
		fileNames: [sourceFileName],
		options: config.compilerOptions,
		errors: []
	}, sourceFileName, false)[0];
}

function setSourceFileReflectId(sourceFile: ts.SourceFile, reflectId: string): ReflectedSourceFileWithReference
{
	(sourceFile as ReflectedSourceFileWithReference)._reflectId = reflectId;
	return sourceFile as ReflectedSourceFileWithReference;
}

function isReflectedSourceFile(type: ts.SourceFile): type is ReflectedSourceFileWithReference
{
	return (type as ReflectedSourceFileWithReference)._reflectId !== undefined;
}