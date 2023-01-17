import {
	getType,
	Type
} from "rttist";


// expect(getType<any>()).toBe(Type.Any);

const arr = getType<Array<number>>();
console.log(arr.isArray());
getType<number[]>();