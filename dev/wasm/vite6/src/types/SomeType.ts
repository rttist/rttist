export type SomeType = {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
	tags?: string[];
	metadata?: Record<string, any>;
};
