import type { FunctionType, Type } from "rttist";
import { Metadata, getType } from "rttist/typelib";
import styles from "./App.module.css";
import rttistLogo from "./assets/rttist.png";
import { Component } from "./types/Component";

class Foo<TType> {
	printNameOfType() {
		console.log("Id of the generic parameter is:", getType<TType>().id);
	}
}

const stringFoo = new Foo<string>();
console.log(stringFoo);

console.log(getType<Foo<string>>().toString());
console.log(Metadata.getTypes().filter((x: Type) => x.isClass()));
console.log(Metadata.getGenericClass(Foo, getType<string>()));
stringFoo.printNameOfType();

const dateFoo = new Foo<Date>();
dateFoo.printNameOfType();

function App() {
	const appComponents = Metadata.getTypes().filter((type) => type.isFunction() && type.exported) as FunctionType[];

	return (
		<div class={styles.App}>
			<header class={styles.header}>
				<img src={rttistLogo} class={styles.logo} alt="logo" />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					class={styles.link}
					href="https://github.com/solidjs/solid"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn Solid 2
				</a>
			</header>

			<div class={styles.card}>
				<h2>Components</h2>
				{appComponents.map((component) => (
					<Component function={component} />
				))}
			</div>
		</div>
	);
}

export default App;
