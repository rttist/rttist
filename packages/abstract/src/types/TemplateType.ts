import type { TemplateTypeMetadata } from "../declarations";
import { Type }                      from "../Type";

export abstract class TemplateType extends Type
{
	public readonly head: string;
	public readonly templateSpans: Array<{ expression: string, literal: string }>;

	protected constructor(initializer: TemplateTypeMetadata)
	{
		super(initializer);
		this.head = initializer.head;
		this.templateSpans = initializer.templateSpans;
	}
}