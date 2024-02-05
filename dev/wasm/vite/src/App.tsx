import { createSignal } from "solid-js";
import solidLogo from "./assets/solid.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { createLogger } from "./logging/logger-factory.ts";
import { getType } from "./metadata.typelib.ts";

function App() {
	const [count, setCount] = createSignal(0);

	class Foo {
		bar: string;
		baz: number;

		constructor(bar: string, baz: number) {
			this.bar = bar;
			this.baz = baz;
		}
	}

	const foo = new Foo("", 5);

	console.log(foo);
	console.log(getType<Foo>().id);
	console.log(getType(Foo).id);

	createLogger<Foo>().then((fooLogger) => {
		fooLogger.log("Hello, world!");
	});

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} class="logo" alt="Vite logo" />
				</a>
				<a href="https://solidjs.com" target="_blank">
					<img src={solidLogo} class="logo solid" alt="Solid logo" />
				</a>
			</div>
			<h1>Vite + Solid</h1>
			<div class="card">
				<button onClick={() => setCount((count) => count + 1)}>count is {count()}</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p class="read-the-docs">Click on the Vite and Solid logos to learn more</p>
		</>
	);
}

export default App;
