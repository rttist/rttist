import solidLogo from "./assets/solid.svg";
import viteLogo from "/vite.svg";
import rttistLogo from "/rttist.png";
import { Metadata } from "./metadata.typelib";
import { Component } from "./types/Component";
import { FunctionType } from "rttist";
import "./App.css";

function App() {
	const appComponents = Metadata.getTypes().filter((type) => type.isFunction() && type.exported) as FunctionType[];

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} class="logo" alt="Vite logo" />
				</a>
				<a href="https://solidjs.com" target="_blank">
					<img src={solidLogo} class="logo solid" alt="Solid logo" />
				</a>
				<a href="https://rttist.org" target="_blank">
					<img src={rttistLogo} class="logo" alt="RTTIST logo" />
				</a>
			</div>
			<h1>Vite + Solid + RTTIST</h1>
			<p class="read-the-docs">Click on the logos to learn more</p>

			<div class="card">
				<h2>Components</h2>
				{appComponents.map((component) => (
					<Component function={component} />
				))}
			</div>
		</>
	);
}

export default App;
