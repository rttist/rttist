export class LogBuffer {
	public static readonly default = new LogBuffer();
	public static readonly autoFlush = new LogBuffer(true);

	private buffer: any[];

	constructor(private readonly autoFlush = false) {
		this.buffer = [];
	}

	log(...args: any[]) {
		if (this.autoFlush) {
			globalThis.console.log(...args);
			return;
		}

		this.buffer.push(args);
	}

	flush() {
		for (const args of this.buffer.splice(0, this.buffer.length)) {
			globalThis.console.log(...args);
		}
	}
}
