type RttistPluginOptions = {
	packageInfo: {
		name: string;
		rootDir: string;
	};
	tsRootDir: string;
	metadataOutDir: string;
};
declare function rttistPlugin(pluginOptions: RttistPluginOptions): any;

export { RttistPluginOptions, rttistPlugin };
