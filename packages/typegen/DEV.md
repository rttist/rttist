
## Notes
- "Metadata" is a term used in `rttist` for a set of properties describing types.
- "Typelib" is a term used in `rttist` for the final file containing all the metadata files for all the modules.



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
- Try to build without parallelization if there is less then x files per CPU, it should be faster.
- If you want to import typescript anywhere in the code under `bin.ts`, you should use `lazyTypescript.get()` almost everywhere. This is because `typescript` is a heavy dependency (it take 200 ms to import it) and we want to load it only when needed - eg. processing everything from cache when there are no changes does not require typescript.