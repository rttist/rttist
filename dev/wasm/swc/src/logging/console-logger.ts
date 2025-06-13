import { ILogger } from "./i-logger";
import { getType } from "../metadata.typelib";

export class ConsoleLogger<TContext> implements ILogger {
	private readonly context: string;

	constructor() {
		this.context = getType<TContext>().name;
	}

	log(...args: any[]): void {
		console.log(`[${this.context}]`, ...args);
	}
}
