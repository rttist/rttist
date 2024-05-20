# RTTIST transformer plugin for Vite

For more information see our website [rttist.org](https://rttist.org) and docs [docs.rttist.org](https://docs.rttist.org).

## Installation

```bash
npm install vite-plugin-rttist -D
# or
pnpm add vite-plugin-rttist -D
# or
yarn add vite-plugin-rttist -D
```

## Usage

```typescript
import { rttistPlugin } from "vite-plugin-rttist"; // < 1. Import the plugin

import { defineConfig } from "vite";
import { join } from "path";
import solid from "vite-plugin-solid";
import packageJson from "./package.json";

export default defineConfig({
	plugins: [
		// < 2. Initialize the plugin
		rttistPlugin({
            // Package/project info used to generate type identifiers
			packageInfo: { name: packageJson.name, rootDir: __dirname },
            // "rootDir" from tsconfig
			tsRootDir: join(__dirname, "src"),
		}),
		solid(),
	],
});
```

## Versioning
This package is versioned by the `Vite` versions. 

New versions will be added only when there are some breaking changes in Vite API, so use the latest version lower or equal to your Vite version.
In case of any problems, please file an issue.

## License
This project is licensed under the [MIT license](./LICENSE).