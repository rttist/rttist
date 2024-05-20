import { FunctionType } from "rttist";
import { Signature } from "./Signature";
import styles from "./Component.module.css";

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
