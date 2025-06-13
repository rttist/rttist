import type { ParameterInfo } from "rttist";
import type { SomeType } from "./SomeType";

type Props = {
	parameter: ParameterInfo;
};

export function Parameter(props: Props) {
	return (
		<span>
			{props.parameter.name}: {props.parameter.type.id}
		</span>
	);
}

type CompProps = {
	test: SomeType;
};

export function Comp(props: CompProps) {}
