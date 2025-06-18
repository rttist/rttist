# RTTIST transformer plugin for esbuild

For more information see our website [rttist.org](https://rttist.org) and docs [docs.rttist.org](https://docs.rttist.org).

## Installation

```bash
npm install esbuild-plugin-rttist -D
# or
pnpm add esbuild-plugin-rttist -D
# or
yarn add esbuild-plugin-rttist -D
```

## Usage

```javascript
const { rttistPlugin } = require("esbuild-plugin-rttist"); // < 1. Import the plugin

const path = require("node:path");
const esbuild = require("esbuild");
const packageJson = require("./package.json");

esbuild
    .build({
        entryPoints: ["src/index.ts"],
        outfile: "dist/out.js",
        platform: "node",
        format: "cjs",
        target: "es2022",
        bundle: true,
        external: Object.keys(packageJson.dependencies).concat(Object.keys(packageJson.peerDependencies || {})),
        plugins: [
            // < 2. Initialize the plugin
            rttistPlugin({
                // Package/project info used to generate type identifiers
                packageInfo: { name: packageJson.name, rootDir: __dirname },
                // "rootDir" from tsconfig
                tsRootDir: path.join(__dirname, "src"),
            }),
        ],
    })
    .catch((err) => {
        console.error(err);
    });
```

## Versioning
This package is versioned by the `esbuild` versions.

New versions will be added only when there are some breaking changes in esbuild API, so use the latest version lower or equal to your esbuild version.
In case of any problems, please file an issue.

## License
This project is licensed under the [MIT license](./LICENSE).