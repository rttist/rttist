import type { CreateSourceFileOptions, Path, ScriptTarget } from "typescript";
import type * as ts from "typescript";
import { projectFilesProvider } from "../project-files-provider";
import { lazyTypescript } from "./utils/lazy-typescript";
import type { Config } from "./config/config";
import type { CachedStorage } from "./cache/cached-storage";

export class TypescriptCompilerHostFactory {
	/**
	 * @param config
	 */
	constructor(private readonly config: Config) {}

	/**
	 * @param compilerOptions
	 * @param sourceFilesCachedStorage CachedStorage for source TS files.
	 */
	public createCompilerHost(compilerOptions: ts.CompilerOptions, sourceFilesCachedStorage: CachedStorage) {
		const sourceFileCache = new Map<string, ts.SourceFile>();

		// TODO: Implement invalidate
		sourceFilesCachedStorage.on("invalidate", (fileName: string) => {});

		const typescript: typeof ts = lazyTypescript.get();

		const host = typescript.createCompilerHost(compilerOptions);

		host.readFile = (fileName: string) => {
			// Do not resolve files that are not included.
			if (!projectFilesProvider.isProjectFile(fileName, this.config)) {
				return "";
			}

			return sourceFilesCachedStorage.readSync(fileName) ?? "";
		};

		host.getSourceFile = (
			fileName: string,
			languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
			onError?: (message: string) => void,
			shouldCreateNewSourceFile?: boolean
		): ts.SourceFile | undefined => {
			if (sourceFileCache.has(fileName)) {
				return sourceFileCache.get(fileName);
			}

			const content = host.readFile(fileName);
			if (!content) {
				return undefined;
			}

			const sourceFile = typescript.createSourceFile(
				fileName,
				content,
				languageVersionOrOptions,
				shouldCreateNewSourceFile ?? false
			);

			sourceFileCache.set(fileName, sourceFile);
			return sourceFile;
		};

		if (host.getSourceFileByPath !== undefined) {
			const origGetSourceFileByPath = host.getSourceFileByPath;

			host.getSourceFileByPath = (
				fileName: string,
				path: Path,
				languageVersionOrOptions: ScriptTarget | CreateSourceFileOptions,
				onError?: (message: string) => void,
				shouldCreateNewSourceFile?: boolean
			) => {
				console.log("!!!!!!!!!!! TS CompilerHost.getSourceFileByPath CALLED !!!!!!!!!!!");
				return origGetSourceFileByPath(
					fileName,
					path,
					languageVersionOrOptions,
					onError,
					shouldCreateNewSourceFile
				);
			};
		}

		// host.writeFile = (fileName: string, contents: string) => {
		// 	writeFileCallback(fileName);
		// };

		// ts.createSourceFile();

		// host.getSourceFile = (
		// 	fileName: string,
		// 	languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
		// 	onError?: (message: string) => void,
		// 	shouldCreateNewSourceFile?: boolean
		// ) => {
		// 	return undefined;
		// };
		// host.getSourceFileByPath = (fileName, path, languageVersionOrOptions, onError, shouldCreateNewSourceFile) => {
		// 	return "";
		// };

		return host;
	}
}
