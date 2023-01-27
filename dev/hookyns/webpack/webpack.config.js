const path = require('path');
const webpack = require("webpack");
const tstReflectTransform = require('tst-reflect-transformer').default;

module.exports = {
	entry: {
		index: './index.ts',
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', 'jsx'],
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, 'dist'),
	},
	mode: 'development',
	stats: 'minimal',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /(node_modules)/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							configFile: path.join(__dirname, 'tsconfig.json'),
							getCustomTransformers: (program) => ({
								before: [tstReflectTransform(program, {})],
							}),
						},
					},
				],
			},
		],
	},
	// plugins: [
	// 	new webpack.IgnorePlugin({
	// 		resourceRegExp: /metadata\.typelib\./,
	// 	})
	// ],
	externals: [
		{
			rttist: 'rttist',
			typelib: /metadata\.typelib\./,
		},
		function ({ context, request }, callback) {
			// if (/^yourregex$/.test(request)) {
			// 	return callback(null, 'commonjs ' + request);
			// }
			
			console.log(context, request);
			
			if (request.includes("metadata")) {
				return callback(null, "commonjs-module " + request);
			}
			
			callback();
		},
	],
};
