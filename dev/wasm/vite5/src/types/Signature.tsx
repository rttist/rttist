import { SignatureInfo } from "rttist";
import { Parameter } from "./Parameter";
import styles from "./Signature.module.css";

type Props = {
	signature: SignatureInfo;
};

export function Signature(props: Props) {
	return (
		<section class={styles.signature}>
			<b>Parameters</b>
			<ul>
				{props.signature.getParameters().map((parameter, i) => (
					<li>
						<Parameter parameter={parameter} />
					</li>
				))}
			</ul>
		</section>
	);
}
