import "rttist/typelib";
import { getType, InterfaceType } from 'rttist';

function printTypeProperties<TType>() {
	const type = getType<TType>();

	console.log(
		(type as InterfaceType)
			.getProperties()
			.map((prop) => prop.name + ': ' + prop.type.name)
			.join('\n')
	);
}

interface SomeType {
	foo: string;
	bar: number;
	baz: Date;
}

printTypeProperties<SomeType>();
