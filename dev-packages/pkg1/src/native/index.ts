class TestAsyncGenerator implements AsyncGenerator<number, number, number>
{
    next(...args: [] | [number]): Promise<IteratorResult<number, number>> {
        throw new Error("Method not implemented.");
    }
    return(value: number | PromiseLike<number>): Promise<IteratorResult<number, number>> {
        throw new Error("Method not implemented.");
    }
    throw(e: any): Promise<IteratorResult<number, number>> {
        throw new Error("Method not implemented.");
    }
    [Symbol.asyncIterator](): AsyncGenerator<number, number, number> {
        throw new Error("Method not implemented.");
    }
	
} 

export class NativeTypes {
	prop1: any;
	prop2: unknown;
	prop3: undefined;
	prop4!: null;
	prop5!: void;
	prop6!: string;
	prop7!: number;
	prop8!: BigInt;
	prop9!: Boolean;
	prop57!: boolean;
	prop58!: true;
	prop59!: false;
	prop10!: Date;
	prop11!: Array<number>;
	prop12!: Array<Array<number>>;
	prop13!: number[];
	prop14!: number[][];
	prop15!: Map<string, string>;
	prop16!: WeakMap<Function, string>;
	prop17!: Set<string>;
	prop18!: WeakSet<Function>;
	prop19!: Int8Array;
	prop20!: Uint8Array;
	prop21!: Uint8ClampedArray;
	prop22!: Int16Array;
	prop23!: Uint16Array;
	prop24!: Int32Array;
	prop25!: Uint32Array;
	prop26!: Float32Array;
	prop27!: Float64Array;
	prop28!: BigInt64Array;
	prop29!: BigUint64Array;
	prop30!: Symbol;
	prop55!: symbol;
	static readonly prop56: unique symbol;
	prop31!: Promise<boolean>;
	prop32!: Error;
	prop33!: RegExp;
	prop34 = /\s\S/;
	prop35!: ArrayBuffer;
	prop36!: SharedArrayBuffer;
	prop37!: Atomics;
	prop38!: DataView;

	prop39!: Generator;
	*generator() {
		yield 1;
	}
	
	prop40!: Iterable<any>;
	prop41 = [].values();
	prop42!: IterableIterator<any>;
	prop43!: AsyncIterator<any>;
	
	prop44!: AsyncGeneratorFunction;
	prop45 = TestAsyncGenerator;
	prop46!: AsyncGenerator<any>;
	async *asyncGenerator() {
		yield Promise.resolve(1);
	}
	prop47 = Function;
	prop48 = Array;
	prop49 = Object;
	prop50 = Date;
	prop51 = RegExp;
	prop52 = Error;
	prop53 = Promise;
	prop54 = Uint8Array;
}