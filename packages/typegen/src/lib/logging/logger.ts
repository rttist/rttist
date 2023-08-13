import { LogBuffer } from "./log-buffer";
import { LogLevel } from "./log-level";
import { dim, gray } from "chalk";
import { LogColor, LogColorNames } from "./log-color";

const LEVEL_MAP = {
	[LogLevel.None]: 0,
	[LogLevel.Trace]: 1,
	[LogLevel.Debug]: 2,
	[LogLevel.Info]: 3,
	[LogLevel.Warning]: 4,
	[LogLevel.Error]: 5,
	[LogLevel.Dev]: 6,
	[LogLevel.Always]: 7,
};

const COLOR_MAP = {
	[LogLevel.None]: undefined,
	[LogLevel.Trace]: LogColor.gray,
	[LogLevel.Debug]: LogColor.magenta,
	[LogLevel.Info]: undefined,
	[LogLevel.Warning]: LogColor.yellow,
	[LogLevel.Error]: LogColor.red,
	[LogLevel.Dev]: undefined,
	[LogLevel.Always]: undefined,
};

// const COLOR_MAP = {
// 	[LogLevel.None]: undefined,
// 	[LogLevel.Trace]: LogColorNames.gray,
// 	[LogLevel.Debug]: LogColorNames.magenta,
// 	[LogLevel.Info]: undefined,
// 	[LogLevel.Warning]: LogColorNames.yellow,
// 	[LogLevel.Error]: LogColorNames.red,
// 	[LogLevel.Dev]: undefined,
// 	[LogLevel.Always]: undefined,
// };

function writeToConsole(
	logBuffer: LogBuffer,
	level: LogLevel,
	color: number | undefined,
	prefix: string,
	contextSuffix: string,
	args: any[]
) {
	if (color) {
		logBuffer.log(
			`${gray(`[${level}]`)} ${dim(prefix)}\x1b[${color}m`,
			...args.flatMap((arg) => (typeof arg !== "string" ? ["\x1b[0m", arg, `\x1b[${color}m`] : [arg])),
			contextSuffix,
			"\x1b[0m"
		);
	} else {
		logBuffer.log(`${gray(`[${level}]`)} ${dim(prefix)}`, ...args, contextSuffix);
	}
}

// export function colorText(text: string, color: number) {
// 	return `\x1b[${color}m${text}\x1b[0m`;
// }

export class Logger {
	private readonly contextSuffix: string;
	private static logLevel: number;
	private static globalPrefix?: string;

	constructor(
		private readonly prefix: string,
		context?: string,
		public readonly buffer: LogBuffer = LogBuffer.default
	) {
		this.contextSuffix = context ? "\n\tContext: " + context : "";
	}

	/**
	 * Set logging level for all the logger instances.
	 * @param logLevel
	 */
	static setLevel(logLevel: LogLevel) {
		this.logLevel = LEVEL_MAP[logLevel];
	}

	/**
	 * Set global prefix for all the logger instances.
	 * @param prefix
	 */
	static setGlobalPrefix(prefix: string) {
		this.globalPrefix = prefix;
	}

	when(level: LogLevel, argsCallback: () => any[]) {
		if (LEVEL_MAP[level] < Logger.logLevel) {
			return;
		}

		writeToConsole(this.buffer, level, COLOR_MAP[level], this.getPrefix(), this.contextSuffix, argsCallback());
	}

	/**
	 * Log message of given level.
	 * @param level
	 * @param color
	 * @param args
	 */
	log(level: LogLevel, color?: number, ...args: any[]) {
		if (LEVEL_MAP[level] < Logger.logLevel) {
			return;
		}
		writeToConsole(this.buffer, level, color, this.getPrefix(), this.contextSuffix, args);
	}

	private getPrefix() {
		let prefix = "";

		if (Logger.globalPrefix) {
			prefix += `(${Logger.globalPrefix}) `;
		}

		if (this.prefix) {
			prefix += `${this.prefix}: `;
		}
		return prefix;
	}

	/**
	 * Log TRACE message.
	 * @param args
	 */
	trace(...args: any[]) {
		this.log(LogLevel.Trace, LogColor.gray, ...args);
		// this.log(LogLevel.Trace, LogColorNames.gray, ...args);
	}

	/**
	 * Log TRACE message.
	 * @param argsCallback
	 */
	ifTrace(argsCallback: () => any[]) {
		this.when(LogLevel.Trace, argsCallback);
	}

	/**
	 * Log DEBUG message.
	 * @param args
	 */
	debug(...args: any[]) {
		this.log(LogLevel.Debug, LogColor.magenta, ...args);
		// this.log(LogLevel.Debug, LogColorNames.magenta, ...args);
	}

	/**
	 * Log DEBUG message.
	 * @param argsCallback
	 */
	ifDebug(argsCallback: () => any[]) {
		this.when(LogLevel.Debug, argsCallback);
	}

	/**
	 * Log INFO message.
	 * @param args
	 */
	info(...args: any[]) {
		this.log(LogLevel.Info, undefined, ...args);
	}

	/**
	 * Log INFO message.
	 * @param argsCallback
	 */
	ifInfo(argsCallback: () => any[]) {
		this.when(LogLevel.Info, argsCallback);
	}

	/**
	 * Log WARN message.
	 * @param args
	 */
	warn(...args: any[]) {
		this.log(LogLevel.Warning, LogColor.yellow, ...args);
		// this.log(LogLevel.Warning, LogColorNames.yellow, ...args);
	}

	/**
	 * Log WARN message.
	 * @param argsCallback
	 */
	ifWarn(argsCallback: () => any[]) {
		this.when(LogLevel.Warning, argsCallback);
	}

	/**
	 * Log ERROR message.
	 * @param args
	 */
	error(...args: any[]) {
		this.log(LogLevel.Error, LogColor.red, ...args);
		// this.log(LogLevel.Error, LogColorNames.red, ...args);
	}
}
