# @rttist/typegen

> Type generator for `rttist`.

For more information see our website [rttist.org](https://rttist.org) and docs [docs.rttist.org](https://docs.rttist.org).

## CLI
This package provides a CLI (cmd `typegen`) for generating metadata library in the `rttist` format.
Use `--help` for more information.

## Notes
- 




## Dev Notes
- Generate metadata typelib file as:
    ```typescript
    export function addMetadata(library: MetadataLibrary) {
        library.addModule({/* ... */});
    }
    ```
    So we can call it multiple times and it will add the metadata only to the given library, so there can be more libraries at runtime with different scopes.
    This is required for solving `stripInternals`. End-user project and every package will have custom library excluding internals of 3rd parties.
- To speed thinks up, keep list of all TS files and its moduleIds in memory.