import { ILogger } from "./i-logger";
import { Metadata, getType } from "../metadata.typelib";

let LoggerCtor: { new (): ILogger } | undefined;

export async function createLogger<T>(): Promise<ILogger> {
	if (LoggerCtor === undefined) {
		const loggerType = Metadata.getTypes().find(
			(t) => t.isClass() && !t.abstract && t.implements.some((i) => i.name === "ILogger")
		);

		if (!loggerType) {
			throw new Error("Unable to find a logger type");
		}

		const loggerModule = await loggerType.module.import();

		if (!loggerModule) {
			throw new Error("Unable to load module of logger type " + loggerType.id);
		}

		LoggerCtor = loggerModule[loggerType.name];

		if (!LoggerCtor) {
			throw new Error("Unable to find constructor of logger type " + loggerType.id);
		}
	}

	return Rttist.constructGeneric(LoggerCtor, [getType<T>()], []);
}
