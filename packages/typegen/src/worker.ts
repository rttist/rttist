import { parentPort, workerData } from "worker_threads";
import { WorkerArguments } from "./declarations/worker-arguments";
import { WorkerMessage } from "./declarations/worker-message";
import { generateModulesMetadata } from "./lib/generator/generate-modules-metadata";
import { Logger } from "./lib/logging";
import { logBuffer } from "./lib/logging/log-buffer";
import { resolvePath } from "./lib/utils/path";
import { WorkerMessageType } from "./declarations/worker-message-type";

// console.log(); // TODO: Required for debugging, idk why.

const workerArguments = workerData as WorkerArguments;
const files = workerArguments.files.map((filePath) => resolvePath(workerArguments.config.projectRoot, filePath));

Logger.setLevel(workerArguments.config.logLevel);

// Listen for messages
parentPort?.addListener("message", flushHandler);

// Generate metadata
generateModulesMetadata(files, workerArguments.config, (filename) => {
	parentPort?.postMessage({
		type: WorkerMessageType.FileFinished,
	});
});

// POST Message GenerationCompleted
parentPort?.postMessage({
	type: WorkerMessageType.GenerationCompleted,
});

function flushHandler(message: WorkerMessage) {
	switch (message.type) {
		case WorkerMessageType.FlushLogBuffer:
			logBuffer.flush();
			parentPort?.removeListener("message", flushHandler);
			break;
	}
}
