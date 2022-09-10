Reflect.addModule([
	{
		name: "",
		id: "@dev-pkg1/index.ts",
		// TODO: --In case we are building package, create path for the package, not FS path. ie. `dev-pkg1/dist/index.js`. which will not work locally, which is (not) ok?!--
		//  Create relative path from this typelib. It will work locally and with packages too. `dev-pkg1/dist/index.js` will be inside metadata.index.json file.
		path: "F:/Work/packages/tst-reflect-private/dev-packages/dev-pkg1/dist/index.js",
		children: []
	},
	{
		id: "@quick-tests/SomeType.ts::SomeType",
		kind: 1,
		name: "SomeType",
		properties: [
			{
				name: "initValue",
				type: {kind: 14},
				decorators: [],
				flags: 6
			},
			{
				name: "anyProp",
				type: {kind: 14},
				decorators: [],
				flags: 0
			},
			{
				name: "bar",
				type: {kind: 14},
				decorators: [],
				flags: 26
			}
		],
		nullable: true
	}
]);