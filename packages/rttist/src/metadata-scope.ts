import type { MetadataLibrary } from "./Metadata";

export const MetadataScope: {
	readonly current: MetadataLibrary;
	setScope(scope: MetadataLibrary): void;
	doWithScope(scope: MetadataLibrary, action: () => void): void;
} = {
	current: null!,

	setScope(scope: MetadataLibrary): void {
		(this.current as any) = scope;
	},

	doWithScope(scope: MetadataLibrary, action: () => void): void {
		const previousScope = this.current;
		this.setScope(scope);
		try {
			return action();
		} finally {
			this.setScope(previousScope);
		}
	},
};
