import rttistLogo from "./assets/rttist.png";
import styles from "./App.module.css";
import { FunctionType } from "rttist";
import { Metadata } from "./metadata.typelib";
import { Component } from "./types/Component";

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
					Learn Solid
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
