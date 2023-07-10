import { ModuleIds } from "@rttist/core";
import * as path from "path";
import { ModuleIdentifier } from "rttist";
import * as ts from "typescript";
import { Config } from "../config/config";
import { TransformerContext } from "./contexts/transformer-context";
import { ReflectedSourceFileWithReference } from "./metadata/transformer-type-reference";
import { removeExtension } from "./utils/removeExtension";

const PATH_SEPARATOR_REGEX = /\\/g;
const NODE_MODULES_PATTERN = "/node_modules/";
const TS_LIB_PATTERN = "/node_modules/typescript/lib/lib.";

// TODO: Review paths

export function getSourceFileId(sourceFile: ts.SourceFile, transformerContext: TransformerContext): ModuleIdentifier {
	if (isReflectedSourceFile(sourceFile)) {
		return sourceFile._reflectId;
	}

	if (sourceFile.fileName === undefined) {
		return ModuleIds.Invalid;
	}

	if (sourceFile.fileName.includes(TS_LIB_PATTERN)) {
		return ModuleIds.Native;
	}

	const { packageInfo, projectRoot } = transformerContext.config;
	const isExternal = transformerContext.program.isSourceFileFromExternalLibrary(sourceFile);

	if (isExternal) {
		const dependencyInfo = transformerContext.dependencyManager.getDependencyInfo(sourceFile.fileName);

		if (dependencyInfo !== undefined) {
			const sourceFileId = removeExtension(
				"@" + dependencyInfo.packageName + sourceFile.fileName.slice(dependencyInfo.packageRoot.length)
			);
			setSourceFileReflectId(sourceFile, sourceFileId);
			return sourceFileId;
		}
	}

	// TODO: There will be issue with packages which have strange .d.ts locations.
	const filePath = getOutPathForSourceFile(sourceFile.fileName, transformerContext.config);
	const nodeModulesIndex = filePath.lastIndexOf(NODE_MODULES_PATTERN);

	const sourceFileId = removeExtension(
		nodeModulesIndex !== -1
			? "@" + filePath.slice(nodeModulesIndex + NODE_MODULES_PATTERN.length)
			: "@" + packageInfo.name + "/" + path.relative(projectRoot, filePath).replace(PATH_SEPARATOR_REGEX, "/")
	);

	setSourceFileReflectId(sourceFile, sourceFileId);

	return sourceFileId;
}

function getOutPathForSourceFile(sourceFileName: string, config: Config): string {
	if (sourceFileName.slice(-5) === ".d.ts") {
		return sourceFileName;
	}

	return ts.getOutputFileNames(
		{
			fileNames: [sourceFileName],
			options: config.compilerOptions,
			errors: [],
		},
		sourceFileName,
		false
	)[0];
}

function setSourceFileReflectId(sourceFile: ts.SourceFile, reflectId: string): ReflectedSourceFileWithReference {
	(sourceFile as ReflectedSourceFileWithReference)._reflectId = reflectId;
	return sourceFile as ReflectedSourceFileWithReference;
}

function isReflectedSourceFile(type: ts.SourceFile): type is ReflectedSourceFileWithReference {
	return (type as ReflectedSourceFileWithReference)._reflectId !== undefined;
}
