/* tslint:disable */
/* eslint-disable */

/**
 * Object that contains information about the package(/project) being transformed.
 */
export class PackageInfo {
    /**
    * @param {string} name
    * @param {string} rootDir
    */
    constructor(name: string, rootDir: string);
}

export enum ModuleSystem {
    Preserve = 0,
    ESModule = 1,
    CommonJS = 2,
}

/**
 * Transformer configuration.
 */
export type Config = {
    module: ModuleSystem;
    runtimeGenericClasses: boolean;
};

/**
 * Transformer configuration.
 */
export type CompilerOptions = {
    target: string;
    jsxFactory: string;
    jsxFragmentFactory: string;
    /**
     * Generate inlined source maps.
     */
    sourcemap: boolean;
};

/**
 * Transforms the TypeScript code to be compatible with the RTTIST reflection.
 * @param code
 * @param path
 * @param packageInfo
 * @param config
 */
export function transform(code: string, path: string, packageInfo: PackageInfo, config: Config): string;

/**
 * Transforms the code to be compatible with the RTTIST reflection and transpiles it to JavaScript.
 * @param code
 * @param path
 * @param packageInfo
 * @param config
 * @param compilerOptions
 */
export function transpile(code: string, path: string, packageInfo: PackageInfo, config: Config, compilerOptions: CompilerOptions): string;

/**
 * Loads a file from the file system and returns code compatible with the RTTIST reflection.
 * @description This function is available only in WASI.
 * @param path
 * @param packageInfo
 * @param config
 * @param compilerOptions If provided, the code will be transpiled to JavaScript, otherwise it will return transformed TypeScript code.
 */
export function load(path: string, packageInfo: PackageInfo, config: Config, compilerOptions?: CompilerOptions): string;


