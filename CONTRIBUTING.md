# Contributing Guide

Welcome and thank You for investing your time in contributing to my project! :tada:

## How to Start

* Fork the repository,
* create a branch with your feature,
* install pnpm (`npm i pnpm -g`) if you don't have it yet. (this is a monorepo configured via pnpm; npm workspaces are still quite bad)
* Run `pnpm install` in the repository root `.` directory,
* make your changes in `./packages/core`, `./packages/rttist` and/or `./packages/typegen` (to build the packages check scripts in corresponding package.json file; every project can be built by the `tsc`, but some of them are bundled using the esbuild),
* try your changes - you can put your development testing code into `./dev/{your name}`,
* update tests,
* run tests by `npm test` from project root,
* make a PR into the `devel` branch.

## Debugging TypeGen

Run the TypeGen by `node packages/typegen/dist/bin.js`.

### Dev mode

To enable developer mode and logging, you must update reflect.config.js.

```json
{
    "devMode": true,
    "logLevel": "Trace"
}
```

## Some rules

* Use type imports `import type {} from ""` whenever it is possible. In rttist package there is problem with circular dependencies.
* Use `===` equality.

## Code-style
This project use Prettier. There is `.prettierrc` config file in the repository root. There are no GIT hooks yet so please use the prettier to format the code using your IDE.