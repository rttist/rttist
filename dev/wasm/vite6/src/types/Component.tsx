import type { FunctionType } from "rttist";
import styles from "./Component.module.css";
import { Signature } from "./Signature";

type Props = {
	function: FunctionType;
};

export function Component(props: Props) {
	return (
		<section class={styles.wrapper}>
			<h1 class={styles.header}>
				{props.function.name}
				<sub> component</sub>
			</h1>

			<div>
				<b>Signatures</b>
				{props.function.getSignatures().map((signature, i) => (
					<Signature signature={signature} />
				))}
			</div>
		</section>
	);
}
