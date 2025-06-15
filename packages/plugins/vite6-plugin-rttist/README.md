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
            // project root where tsconfig.json and reflect.config.json are located
            projectRoot: join(__dirname, "src"),
        }),
        solid(),
    ],
});
```

> You do not need to install `@rttist/typegen` or any transformer, the plugin will handle it for you.

## Versioning
This package is versioned by the `Vite` versions.

New versions will be added only when there are some breaking changes in Vite API, so use the latest version lower or equal to your Vite version.
In case of any problems, please file an issue.

Compatibility table:

| Plugin version | Vite version |
|----------------|--------------|
| 6.x            | **6.x**, 5.x |
| 5.x            | 5.x, (6.x)   |

Vite plugin API in version 6 is compatible with Vite 5, so you can use the latest version of the plugin with Vite 5.

### Vite HMR Notice!
Vite 5 (and maybe some Vite 6 early versions) has an issue with circular dependencies. In case HMR is invoked for a module with circular dependencies, your browser is most likely going to freeze because of the Vite trying to refresh everything again and again.
It was fixed in Vite 6 by this PR: https://github.com/vitejs/vite/pull/19870

## License
This project is licensed under the [MIT license](./LICENSE).