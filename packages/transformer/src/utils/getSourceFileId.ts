import { ModuleIdentifier }                 from "rttist";
import { ModuleIds }                        from "@rttist/core";
import path                                 from "path";
import * as ts                              from "typescript";
import { TransformerContext }               from "../contexts/TransformerContext";
import { ReflectedSourceFileWithReference } from "../declarations/general";

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

function removeExtensions(sourceFileId: string)
{
	if (sourceFileId.slice(-5) === ".d.ts")
	{
		return sourceFileId.slice(0, -5);
	}

	const last3 = sourceFileId.slice(-3);

	if (last3 === ".js" || last3 === ".ts")
	{
		return sourceFileId.slice(0, -3);
	}

	const last4 = sourceFileId.slice(-4);

	if (last4 === ".jsx" || last4 === ".tsx"
		|| last4 === ".cjs" || last4 === ".cts"
		|| last4 === ".mjs" || last4 === ".mts"
	)
	{
		return sourceFileId.slice(0, -4);
	}

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