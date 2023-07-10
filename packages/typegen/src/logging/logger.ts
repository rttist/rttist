import { LogColor } from "./log-color";
import { LogLevel } from "./log-level";

const LEVEL_MAP = {
	[LogLevel.None]: 0,
	[LogLevel.Trace]: 1,
	[LogLevel.Debug]: 2,
	[LogLevel.Info]: 3,
	[LogLevel.Warning]: 4,
	[LogLevel.Error]: 5,
	[LogLevel.Dev]: 6,
};

const COLOR_MAP = {
	[LogLevel.None]: undefined,
	[LogLevel.Trace]: LogColor.gray,
	[LogLevel.Debug]: LogColor.magenta,
	[LogLevel.Info]: undefined,
	[LogLevel.Warning]: LogColor.yellow,
	[LogLevel.Error]: LogColor.red,
	[LogLevel.Dev]: undefined,
};

function writeToConsole(
	level: LogLevel,
	color: number | undefined,
	prefix: string,
	contextSuffix: string,
	args: any[]
) {
	if (color) {
		console.log.apply(undefined, [
			`\x1b[${color}m[${level}] ${prefix}`,
			...args.flatMap((arg) => (typeof arg !== "string" ? ["\x1b[0m", arg, `\x1b[${color}m`] : [arg])),
			contextSuffix,
			"\x1b[0m",
		]);
	} else {
		console.log.apply(undefined, [`[${level}] ${prefix}`, ...args, contextSuffix]);
	}
}

export class Logger {
	private readonly contextSuffix: string;
	private static logLevel: number;
	private static globalPrefix?: string;

	constructor(
		private readonly prefix: string,
		context?: string
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

		writeToConsole(
			level,
			COLOR_MAP[level],
			!!Logger.globalPrefix ? `(${Logger.globalPrefix}) ${this.prefix} -` : `${this.prefix} -`,
			this.contextSuffix,
			argsCallback()
		);
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

		writeToConsole(
			level,
			color,
			!!Logger.globalPrefix ? `(${Logger.globalPrefix}) ${this.prefix} -` : `${this.prefix} -`,
			this.contextSuffix,
			args
		);
	}

	/**
	 * Log TRACE message.
	 * @param args
	 */
	trace(...args: any[]) {
		this.log(LogLevel.Trace, LogColor.gray, ...args);
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
	}
}
