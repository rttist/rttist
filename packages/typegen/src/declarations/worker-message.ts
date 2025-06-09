import { WorkerMessageType } from "./worker-message-type";

export type WorkerMessage = {
	type: WorkerMessageType;
};

export type FileFinishedWorkerMessagePayload = {
	fileName: string;
	cacheFileName: string;
};
