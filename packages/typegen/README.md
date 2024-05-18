# @rttist/typegen

> Type generator for `rttist`.

Typegen is a standalone cmd tool for generating metadata libraries for `rttist` from TypeScript source files.

For more information see our website [rttist.org](https://rttist.org) and docs [docs.rttist.org](https://docs.rttist.org).

> !! This is just a prototype, not ready for any real use. Intended just for testing!

## CLI
This package provides a CLI (cmd `typegen`) for generating metadata library in the `rttist` format.
Use `--help` for more information.

## Installation
NPM
```bash
npm install @rttist/typegen -g
```

PNPM
```bash
pnpm install @rttist/typegen -g
```


## How Are Ids Generated?
Ids are generated as <code>`@${packageJson.name}/${pathToSourceFileFromRoot}:${nameOfTheType}`</code>.
The `nameOfTheType` is export name of the type in the source file in most cases, but there are exceptions.

**Nested types**
> Nested types are types that are defined inside another type. For example:
> 
> ```typescript
> export class A {
>     static B = class B { }
> }

Names of nested types are generated as names separated by dots. From export name of the parent type to name of the nested type.
So in the example above, the id of the nested type `B` would be `@${packageJson.name}/${pathToSourceFileFromRoot}:A.B`.

**Generic type parameters**

*TODO*

**Anonymous types**
> By anonymous types we mean types that are not explicitly named in the source code, so you cannot target them directly. 
> For example, the following type is anonymous:
> 
> ```typescript
> const x: { a: number } = { a: 1 };
> ```
> 
> In this case, the type `{ a: number }` is anonymous.

Ids for anonymous types are generated as <code>`@@${sourcefile.position}`</code>, where `sourcefile.position` is the position of the type in the source file. That means it is basically random identifier that is unique for a file.