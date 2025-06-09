import { parentPort, workerData, threadId } from "node:worker_threads";
import type { WorkerArguments } from "./declarations/worker-arguments";
import type { WorkerMessage } from "./declarations/worker-message";
import { FsReadWriteOnlyStorage } from "./lib/cache/fs-read-write-only-storage";
import { Logger, LogBuffer } from "./lib/logging";
import { TypescriptCompilerHostFactory } from "./lib/typescript-compilerhost-factory";
import { resolvePath } from "./lib/utils/path";
import { WorkerMessageType } from "./declarations/worker-message-type";
import { MetadataGenerator } from "./lib/metadata-generator";
import { TypescriptProgramProvider } from "./typescript-program-provider";

// console.log("Worker", threadId); // TODO: Required for debugging, idk why.

const workerArguments = workerData as WorkerArguments;
const files = workerArguments.files.map((filePath) => resolvePath(workerArguments.config.projectRoot, filePath));

Logger.setLevel(workerArguments.config.logLevel);

// Listen for messages
parentPort?.addListener("message", flushHandler);

(async () => {
	const compilerHostFactory = new TypescriptCompilerHostFactory(workerArguments.config);
	const typescriptProgramProvider = new TypescriptProgramProvider(workerArguments.config, compilerHostFactory);
	await using metadataGenerator = new MetadataGenerator(
		workerArguments.config,
		typescriptProgramProvider,
		new FsReadWriteOnlyStorage(),
		new FsReadWriteOnlyStorage()
	);

	// Handle metadata file write event
	metadataGenerator.on("write", (metadata) => {
		parentPort?.postMessage({
			type: WorkerMessageType.FileFinished,
		});
	});

	// Generate metadata
	const result = await metadataGenerator.generate(files);

	// POST Message GenerationCompleted
	parentPort?.postMessage({
		type: WorkerMessageType.GenerationCompleted,
	});
})();

function flushHandler(message: WorkerMessage) {
	switch (message.type) {
		case WorkerMessageType.FlushLogBuffer:
			LogBuffer.default.flush();
			// TODO: Investigate why this is needed. Why we just cannot listen for the whole time worker is running?
			parentPort?.removeListener("message", flushHandler);
			break;
	}
}
