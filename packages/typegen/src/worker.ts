import { parentPort, workerData, threadId } from "worker_threads";
import { WorkerArguments } from "./declarations/worker-arguments";
import { WorkerMessage } from "./declarations/worker-message";
import { Logger } from "./lib/logging";
import { LogBuffer } from "./lib/logging/log-buffer";
import { resolvePath } from "./lib/utils/path";
import { WorkerMessageType } from "./declarations/worker-message-type";
import { MetadataGenerator } from "./lib/metadata-generator";

// console.log("Worker", threadId); // TODO: Required for debugging, idk why.

const workerArguments = workerData as WorkerArguments;
const files = workerArguments.files.map((filePath) => resolvePath(workerArguments.config.projectRoot, filePath));

Logger.setLevel(workerArguments.config.logLevel);

// Listen for messages
parentPort?.addListener("message", flushHandler);

const metadataGenerator = new MetadataGenerator(workerArguments.config);

// Handle metadata file write event
metadataGenerator.on("write", (sourceFilePath, metadataPath) => {
	parentPort?.postMessage({
		type: WorkerMessageType.FileFinished,
	});
});

// Generate metadata
metadataGenerator
	.generate(files)
	.then(() => {
		// POST Message GenerationCompleted
		parentPort?.postMessage({
			type: WorkerMessageType.GenerationCompleted,
		});
	})
	.finally(() => {
		metadataGenerator.dispose();
	});

function flushHandler(message: WorkerMessage) {
	switch (message.type) {
		case WorkerMessageType.FlushLogBuffer:
			LogBuffer.default.flush();
			parentPort?.removeListener("message", flushHandler);
			break;
	}
}
