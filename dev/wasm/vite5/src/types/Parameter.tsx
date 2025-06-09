import type { ParameterInfo } from "rttist";

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

// export function test(props: { test: string }) {}
