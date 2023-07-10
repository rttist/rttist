import { parentPort, workerData } from "worker_threads";
import { WorkerArguments } from "./declarations/worker-arguments";
import { generateModulesMetadata } from "./generator/generate-modules-metadata";
import { Logger } from "./logging";
import { resolvePath } from "./utils/path";
import { MessageType } from "./workers-messaging";

const workerArguments = workerData as WorkerArguments;
const files = workerArguments.files.map((filePath) => resolvePath(workerArguments.config.projectRoot, filePath));

// Logger.setGlobalPrefix("@rttist/typegen");
Logger.setLevel(workerArguments.config.logLevel);

generateModulesMetadata(files, workerArguments.config, (filename) => {
	parentPort?.postMessage({
		type: MessageType.FileFinished,
	});
});
