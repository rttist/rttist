import { PACKAGE_ID } from "../consts";
import { LogColor }   from "./LogColor";
import { LogLevel }   from "./logLevel";

const LEVEL_MAP = {
	[LogLevel.Trace]: 0,
	[LogLevel.Debug]: 1,
	[LogLevel.Info]: 2,
	[LogLevel.Warning]: 3,
	[LogLevel.Error]: 4,
};

export class Logger
{
	private readonly contextSuffix: string;
	private static logLevel: number;

	constructor(context?: string)
	{
		this.contextSuffix = context ? "\n\tIn " + context : "";
	}

	/**
	 * Set logging level for all the logger instances.
	 * @param logLevel
	 */
	static setLevel(logLevel: LogLevel)
	{
		this.logLevel = LEVEL_MAP[logLevel];
	}

	/**
	 * Log message of given level.
	 * @param level
	 * @param color
	 * @param args
	 */
	log(level: LogLevel, color?: number, ...args: any[])
	{
		if (LEVEL_MAP[level] < Logger.logLevel)
		{
			return;
		}

		if (color)
		{
			console.log.apply(
				undefined,
				[`\x1b[${color}m[${level}] ${PACKAGE_ID}`, ...args, this.contextSuffix, "\x1b[0m"]
			);
		}
		else
		{
			console.log.apply(undefined, [`[${level}] ${PACKAGE_ID}`, ...args, this.contextSuffix]);
		}
	}

	/**
	 * Log TRACE message.
	 * @param args
	 */
	trace(...args: any[])
	{
		this.log(LogLevel.Trace, LogColor.gray, ...args);
	}

	/**
	 * Log DEBUG message.
	 * @param args
	 */
	debug(...args: any[])
	{
		this.log(LogLevel.Debug, LogColor.magenta, ...args);
	}

	/**
	 * Log INFO message.
	 * @param args
	 */
	info(...args: any[])
	{
		this.log(LogLevel.Info, undefined, ...args);
	}

	/**
	 * Log WARN message.
	 * @param args
	 */
	warn(...args: any[])
	{
		this.log(LogLevel.Warning, LogColor.yellow, ...args);
	}

	/**
	 * Log ERROR message.
	 * @param args
	 */
	error(...args: any[])
	{
		this.log(LogLevel.Error, LogColor.red, ...args);
	}
}

export const log = new Logger();