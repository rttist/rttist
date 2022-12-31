# Contributing Guide

Welcome and thank You for investing your time in contributing to my project! :tada:

## How to Start

* Fork the repository,
* create a branch with your feature,
* install pnpm (`npm i pnpm -g`) if you don't have it yet. (this is a monorepo configured via pnpm; npm workspaces are still quite bad)
* run `pnpm install` in repository root `.` directory, which is monorepo root (using npm workspaces) - this will create root `node_modules` directory with symlinks to the transformer and runtime packages,
* open project in your favorite IDE (I use JetBrains products such as Webstorm and Rider; there is an .editorconfig with all style rules in the repository),
* make your changes in `./packages/core` and/or `./packages/abstract` (use `tsc` to rebuild the package),
* cd into the `./dev/xxx`,
* `npx ttsc` and try your changes,
* update tests,
* run tests by `npm test` from project root,
* make a PR into the `devel` branch.

## Debugging

Run compiler using `node ttypescript/bin/tsc` inside one of the dev directories,
eg. `cd dev/hookyns/1 && node ../../node_modules/ttypescript/bin/tsc`

### Dev mode

To enable developer mode and logging, you must update reflect.config.

```json
{
    "devMode": true,
    "logLevel": "Trace"
}
```

## Some rules

* Use type imports `import type {} from ""` whenever it is possible. In abstract package there is problem with circular dependencies so type imports help to identify issues.
