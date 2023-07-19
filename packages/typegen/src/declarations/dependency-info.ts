export type DependencyInfo = {
	packageName: string;
	packageRoot: string;
	pathRegex: RegExp;
	metadataPath?: string;
};
